import React, { Fragment } from 'react';
import styled from 'styled-components';
import IOrder from '@sellout/models/.dist/interfaces/IOrder';
import { Colors, Loader, LoaderSizes  } from '@sellout/ui';
import ScrollTable, {
  ScrollTableBody,
  ScrollTableBodyCell,
  ScrollTableBodyRow,
  ScrollTableHeader,
  ScrollTableHeaderCell,
  ScrollTableNoContent,
  ScrollTableSpace,
} from './ScrollableTable';
import NoSearchItemsFound from './NoSearchItemsFound';
import { useMutation } from '@apollo/react-hooks';
import TextButton, { TextButtonSizes } from '@sellout/ui/build/components/TextButton';
import REMAP_WEBFLOW_SITE from '@sellout/models/.dist/graphql/mutations/remapWebFlowSite.mutation';
import Button, { ButtonTypes } from '@sellout/ui/build/components/Button';
import { IWebFlowSite } from '@sellout/models/.dist/interfaces/IWebFlow';

const Container = styled.div`
  display: flex;
  height: fit-content;
  max-height: 100%;
  max-width: 1400px;
  padding-bottom: 30px;
`;

const NoContentHead = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.Grey1};
  margin-bottom: 5px;
`;

const NoContentBody = styled.div`
  font-weight: 500;
  font-size: 1.8rem;
  color: ${Colors.Grey3};
`;

const LoaderContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${Colors.White};
  border-radius: 0px 0px 10px 10px;
  padding: 10px 0px;
`;

const TableHeader: React.FC = () => (
  /** Render */
  <ScrollTableHeader>
    <ScrollTableHeaderCell flex="1">Webflow Site Id</ScrollTableHeaderCell>
    <ScrollTableSpace />
    <ScrollTableHeaderCell flex="1">Name</ScrollTableHeaderCell>
    <ScrollTableSpace />
    <ScrollTableHeaderCell flex="1">Domain</ScrollTableHeaderCell>
    <ScrollTableSpace />
    <ScrollTableHeaderCell flex="1">Actions</ScrollTableHeaderCell>
    <ScrollTableSpace />
  </ScrollTableHeader>
);

type TableRowsProps = {
  sites: IWebFlowSite[];
};

const TableRows: React.FC<TableRowsProps> = ({ sites }) => {
  /** Hooks */
  const [remap, { loading }] = useMutation(REMAP_WEBFLOW_SITE);

  /** Render */
  return (
    <>
      {sites.map((site: IWebFlowSite, index: number) => {
          const {
            webFlowId,
            name,
            domains: [domain = null],
          } = site;
          const url = domain ? `https://${domain.name}` : null;

          return (
            <ScrollTableBodyRow key={index} height="40px">
              <ScrollTableBodyCell flex="1">{webFlowId}</ScrollTableBodyCell>
              <ScrollTableSpace />
              <ScrollTableBodyCell flex="1">{name}</ScrollTableBodyCell>
              <ScrollTableSpace />
              <ScrollTableBodyCell flex="1">
                <>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <TextButton
                        size={TextButtonSizes.Small}
                        onClick={() => null}
                      >
                        {url}
                      </TextButton>
                    </a>
                  ) : 'N/A'}
                </>
              </ScrollTableBodyCell>
              <ScrollTableSpace />
              <ScrollTableBodyCell flex="1">
                <Button
                  type={ButtonTypes.Thin}
                  text='Reconnect all events'
                  loading={loading}
                  onClick={() => {
                    remap({
                      variables: {
                        webFlowId,
                      }
                    });
                  }}
                />
              </ScrollTableBodyCell>
              <ScrollTableSpace />
            </ScrollTableBodyRow>
          );
        })
      }
    </>
  )
};

type SuperAdminWebFlowTable = {
  sites: any;
};

const SuperAdminWebFlowTable: React.FC<SuperAdminWebFlowTable> = ({ sites }) => {
  const scrollContainer = React.useRef<any>(null);

  if (sites.length <= 0) {
    return (
      <Container>
        <ScrollTable>
          <TableHeader />
          <ScrollTableBody>
            <ScrollTableNoContent>
              <NoContentHead>
                No sites yet
              </NoContentHead>
              <NoContentBody>
                Connect a Webflow site
              </NoContentBody>
            </ScrollTableNoContent>
          </ScrollTableBody>
        </ScrollTable>
      </Container>
    )
  }

  return (
    <>
    {sites?.length > 0
      ? (
        <Container>
          <ScrollTable
            scrollContainer={scrollContainer}
          >
            {(loading : boolean) => {
              return (
                <Fragment>
                  <TableHeader />
                  <ScrollTableBody ref={scrollContainer}>
                    <TableRows sites={sites} />
                    {loading && <LoaderContainer>
                      <Loader size={LoaderSizes.Large} color={Colors.Orange} />
                    </LoaderContainer>}
                  </ScrollTableBody>
                </Fragment>
              );
            }}
          </ScrollTable>
        </Container>
      )
      : (
        <NoSearchItemsFound />
      )}
    </>
  );
}

export default SuperAdminWebFlowTable;