import React, { useState } from 'react';
import styled from 'styled-components';
import MapGL, { Source, Layer } from 'react-map-gl';
import { MAPBOX_TOKEN } from '../env';
import gql from "graphql-tag";
import { useQuery } from '@apollo/react-hooks';
import { Loader, LoaderSizes, Colors, Icon, Icons } from '@sellout/ui';

interface IIpLocation {
  lat: number;
  lng: number;
}

interface IOrderLocation {
  address: IIpLocation;
}

const GET_LOCATION_OF_ORDERS = gql`
  query orders($query: OrderQueryInput, $pagination: PaginationInput) {
    orders(query: $query, pagination: $pagination) {
      address {
        lat
        lng
      }
    }
  }
`;

type MapContainerProps = {
  width: string;
  height: string;
}

const MapContainer = styled.div<MapContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${props => props.height};
  width: ${props => props.width};
  border-radius: 0px 0px 10px 10px;
  overflow: hidden;
  position: relative;
`;

const DisplaySelectorContainer = styled.div`
  background: ${Colors.White};
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0px 10px;
  height: 30px;
  position: absolute;
  top: 20px;
  right: 20px;
`;

type HeatMapProps = {
  query: any;
  width: string;
  height: string;
  setDisplay: any;
}

enum Display {
  Graph = 'Graph',
  Map = 'Map',
}

const HeatMap: React.FC<HeatMapProps> = ({ query, width, height, setDisplay }) => {
  const { startDate, endDate } = query;
  const [viewport, setViewport] = useState({
    latitude: 40,
    longitude: -100,
    zoom: 3,
    bearing: 0,
    pitch: 0,
  });
  const { data, loading, error } = useQuery(GET_LOCATION_OF_ORDERS, {
    variables: {
      query: {
        eventIds: query.eventId ? [query.eventId] : [],
        venueIds: query.venueId ? [query.venueId] : [],
        artistIds: query.artistId ? [query.artistId] : [],
        startDate,
        endDate,
      },
    },
  });

  if (loading) {
    return (
      <MapContainer width={width} height={height}>
        <Loader size={LoaderSizes.Large} color={Colors.Orange} />
      </MapContainer>
    )
  };

  const heatmapLayerOptions = {
    maxzoom: 17,
    type: 'heatmap',
    paint: {
      // increase weight as diameter breast height increases
      // 'heatmap-weight': {
      //   property: 'ticketNum',
      //   type: 'exponential',
      //   stops: [
      //     [1, 0],
      //     [8, 1],
      //   ],
      // },
      // increase intensity as zoom level increases
      'heatmap-intensity': {
        stops: [
          [11, 1],
          [17, 3],
        ],
      },
      // assign color values be applied to points depending on their density
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(236,222,239,0)',
        0.2, 'rgb(208,209,230)',
        0.4, 'rgb(166,189,219)',
        0.6, 'rgb(103,169,207)',
        0.8, 'rgb(28,144,153)',
      ],
      // increase radius as zoom increases
      'heatmap-radius': {
        stops: [
          [11, 15],
          [17, 20],
        ],
      },
      // decrease opacity to transition into the circle layer
      'heatmap-opacity': {
        default: 1,
        stops: [
          [16, 1],
          [17, 0],
        ],
      },
    },
  };

  const orderGeoJson = {
    type: 'FeatureCollection',
    features: [] as any,
  };

  data?.orders.forEach((order: IOrderLocation) => {
    const { address: { lat, lng } } = order;
    if (lat || lng) {
      orderGeoJson.features.push(
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          properties: {},
        },
      );
    }
  });

  return (
    <MapContainer width={width} height={height}>
      <MapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={(data) => {
          setViewport({ ...viewport, ...data });
        }}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        {orderGeoJson.features.length > 0 && (
        <Source type="geojson" data={orderGeoJson as any}>
          <Layer {...heatmapLayerOptions as any} />
        </Source>
        )}
      </MapGL>
      <DisplaySelectorContainer>
        <Icon
          icon={Icons.GraphGrowth}
          color={Colors.Grey4}
          hoverColor={Colors.Grey1}
          size={14}
          margin="0px 10px 0px 0px"
          onClick={() => setDisplay(Display.Graph)}
        />
        <Icon
          icon={Icons.FireRegular}
          color={Colors.Grey1}
          size={14}
          onClick={() => setDisplay(Display.Map)}
        />
      </DisplaySelectorContainer>
    </MapContainer>
  );
}

export default HeatMap;
