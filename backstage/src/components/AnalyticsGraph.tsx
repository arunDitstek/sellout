import React from "react";
import { Colors } from '@sellout/ui';
import * as d3 from 'd3';
import IAnalytics, { AnalyticsIntervalEnum } from '@sellout/models/.dist/interfaces/IAnalytics';
import AnalyticsUtil from '@sellout/models/.dist/utils/AnalyticsUtil';
// import useVenue from '../hooks/useVenue.hook';

type AnalyticsGraphProps = {
  data: IAnalytics;
  width?: number;
  height?: number;
  setHoverIndex?: any;
  timezone?: string|undefined;
  className?:string;
};

const AnalyticsGraph: React.FC<AnalyticsGraphProps> = ({ data, width = 282, height = 85, setHoverIndex, timezone, className }) => {

  const [dataArray, setDataArray] = React.useState<any>([]);
  const svgRef = React.useRef();

  React.useEffect(() => {
    setDataArray(data?.coordinates);
    const svg = d3.select(svgRef.current as any);

    const getHoverWidth = (scale: any) => {
      const hoverWidth = (width / (dataArray.length - 1));
      return hoverWidth;
    };


    /********************
     * Configure Y axis *
     ********************/

    const yScale = d3.scaleLinear()
      .domain([0, AnalyticsUtil.getMaxYVal(dataArray)])
      .range([height - 1, 0])


    /********************
     * Configure X axis *
     ********************/

    const xScale = d3.scalePoint()
      .domain(dataArray.map((item: any) => {
        return item.x;
      }))
      .range([0, width]);


    /**************************************
     * Configure Veritcal Lines and hover *
     **************************************/

    // set key for tick class names
    const key = new Date().getTime();

    // makes the vertical lines and format
    const xAxisGenerator = d3.axisBottom(xScale)
      .tickSize(-height) 
      .tickPadding(0)
      .tickFormat(() => (''));

    // align x axis appropriately and style
    svg.select('.x-axis')
      .style("transform", `translateY(${height}px)`)
      .style("color", Colors.Grey5)
      .call(xAxisGenerator as any);

    // style thin line preset from x-axis
    svg.selectAll(".tick line")
      .each(function(d, i) {
        d3.select(this).attr("class", `tick${d}On${data.label.replace(/\s/g, '')}${key}`)
      })
      .style("color", Colors.Grey5)
      .style("stroke-width", '1px')

    // add wide stroked line as hit box for thin line above and configure hover stuff
    svg.selectAll(".tick")
      .each(function(d: any, i) { // add top tool tip
        d3.select(this)
        .append('text')
        .attr('class', `tooltip${d}On${data.label.replace(/\s/g, '')}${key}`)
        .text(AnalyticsUtil.getDateFormat(d, data.interval as AnalyticsIntervalEnum, timezone))
        .attr('font-size', '12')
        .attr('text-anchor', 'middle')
        .attr('y', `-${height + 10}px`)
        .attr('x', '0px')
        .attr('fill', Colors.Grey1)
        .attr('opacity', '0')
      })
      .append("line")
      .attr("fill", "none")
      .attr("stroke", Colors.Grey5)
      .attr('opacity', '0')
      .attr("stroke-width", `${getHoverWidth(xScale)}`)
      .attr('y2', `-${height}`)
      .on('mouseover', function (d, i) {
        if (setHoverIndex) {
          setHoverIndex(d);
        }
        d3.select(`.tick${d}On${data.label.replace(/\s/g, '')}${key}`).transition()
        .duration(100)
        .style("stroke", Colors.Grey2)
        // if (i !== 0 && i !== dataArray.length - 1) {
          d3.select(`.tooltip${d}On${data.label.replace(/\s/g, '')}${key}`).transition()
          .duration(100)
          .style("opacity", '1')
        // }
      })
      .on('mouseout', function (d, i) {
        if (setHoverIndex) {
          setHoverIndex(undefined);
        }
        d3.select(`.tick${d}On${data.label.replace(/\s/g, '')}${key}`).transition()
        .duration(100)
        .style("stroke", Colors.Grey5)
        d3.select(`.tooltip${d}On${data.label.replace(/\s/g, '')}${key}`).transition()
        .duration(100)
        .style("opacity", '0')
      })

    /***********************
     * Configure Data line *
     ***********************/

    const lineGenerator = d3.line()
      .x((data: any) => xScale(data.x) as any)
      .y((data: any) => yScale(data.y) as any);

    // render path element, and attach the 'd' attribute from the line generator above
    const path = svg.selectAll(".line")
      .data([dataArray])
      .join("path")
      .attr("class", "line")
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", Colors.Green)
      .attr("stroke-width", "2")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .lower() // put behind tick marks so hovering this line doesn't effect metric display numbers

    // animate path on render
    const dataline = d3?.select('.line')?.node() as any;
    const pathLength = dataline.getTotalLength();
    const transitionPath = d3
      .transition()
      .ease(d3.easeQuadInOut)
      .duration(1000);
    path
      .attr("stroke-dashoffset", pathLength)
      .attr("stroke-dasharray", pathLength)
      .transition(transitionPath as any)
      .attr("stroke-dashoffset", 0);
  }, [data, dataArray, height, setHoverIndex, width]);

  /** Render */
  return (
    <div>
      <svg
        ref={svgRef as any}
        className={className}
        width={width}
        height={height}
        overflow="visible"
      >
        <g className="x-axis"/>
      </svg>
    </div>
  )
};

export default AnalyticsGraph;
