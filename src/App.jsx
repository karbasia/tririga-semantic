import { useState, useEffect } from 'react'
import Client from 'tririga-js-sdk';
import { DataGrid } from '@mui/x-data-grid';
import SemanticSearch from './SemanticSearch';
import './App.css'

function App() {
  const [client, setClient] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });
  const [reportList, setReportList] = useState([]);
  const [queryOptions, setQueryOptions] = useState({ tag: 'Semantic' });
  const [reportData, setReportData] = useState({data: []});

  const columns = [
    {
      field: 'moduleName',
      headerName: 'Module',
      width: 150,
      sortable: true,
    },
    {
      field: 'boNames',
      headerName: 'Business Object',
      width: 200,
      sortable: true,
    },
    {
      field: 'HtmlEscapedName',
      headerName: 'Name',
      width: 400,
      sortable: true,
    },
    {
      field: 'HtmlEscapedTitle',
      headerName: 'Title',
      width: 300,
      sortable: true,
    }
  ];

  useEffect(() => {
    if (!client) {
      initClient();
    }
  }, [client]);

  const initClient = async () => {
    try {
      const uxClient = await Client.CreateClient(true);
      setClient(uxClient);
    } catch (err) {
      setError(err.message);
    }
  }

  const fetchReports = async () => {
    setLoading(true);
    const reports = await client.report.getQueryList(paginationModel.page, paginationModel.pageSize, queryOptions);
    setReportList(reports.data)
    setTotalRows(reports.totalCount);
    setLoading(false);
  }

  const onRowClick = (params) => {
    fetchReportData(params.row.reportId);
  }

  const fetchReportData = async (reportId) => {
    const reportResults = await client.report.getReportData(reportId, 0, 1000);
    setReportData(reportResults);
  }

  const onFilterChange = async (filterModel) => {
    // POC filters the report list by the tag of Semantic by default
    const reportFilters = { tag: 'Semantic' };
    await filterModel.items.map((item) => {
      // The report headers and filters are not consistent. I should map this correctly within the SDK instead.
      if (item.field === 'boNames') {
        reportFilters['boName'] = item.value;
      } else if (item.field === 'HtmlEscapedName') {
        reportFilters['name'] = item.value;
      } else {
        reportFilters[item.field] = item.value;
      }
      
    })
    setQueryOptions(reportFilters);
  }

  useEffect(() => {
    if (client) {
      fetchReports();
    }
  }, [paginationModel, queryOptions, client]);

  return (
    <>
      <div>
      </div>
      <h1>TRIRIGA Semantic Search</h1>
      <p>
      {error}
      {!error && reportData.data.length > 0 && 
        <SemanticSearch 
          reportData={reportData} 
          appConfig={client.appConfig} 
        />
      }
      {!error && reportData.data.length === 0 &&
        <div>
          <p>Select a report to get started.</p>
          <DataGrid
            rows={reportList}
            columns={columns}
            getRowId={(row) => row.reportId}
            onRowClick={onRowClick}
            pageSizeOptions={[50]}
            paginationMode='server'
            loading={loading}
            rowCount={totalRows}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            filterMode="server"
            onFilterModelChange={onFilterChange}
            sx={{'& .MuiDataGrid-cell:hover': {
                  cursor: 'pointer'
                }}}
          />
        </div>}
      </p>
    </>
  )
}

export default App
