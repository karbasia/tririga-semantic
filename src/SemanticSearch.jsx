import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { DataGrid } from '@mui/x-data-grid';
import Link from '@mui/material/Link';
import SemanticWorker from './worker?worker';
import Progress from './components/Progress';

function SemanticSearch({ reportData, appConfig }) {

  SemanticSearch.propTypes = {
    reportData: PropTypes.object,
    appConfig: PropTypes.object,
  }

  const [ready, setReady] = useState(false);
  const [progressItems, setProgressItems] = useState([]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  const worker = useMemo(() => new SemanticWorker(), []);

  // Set the table properties whenever the report data is updated or results are returned
  useEffect(() =>{
    if (!output && reportData && reportData.data.length > 0) {
      setColumns(generateColDefinition('record_id', reportData.headers[0].id));
      setData(reportData.data);
    } else {
      setColumns(generateColDefinition('id', 'title'));
      setData(output);
    }
  }, [reportData, output]);

  // Start the embeddings when report data is provided
  useEffect(() => {
    if (window.Worker && reportData && reportData.data) {
      worker.postMessage({
        action: 'embed',
        data: reportData.data,
        header: reportData.headers[0].id,
      });
    }
  }, [worker, reportData]);

  // Set up the worker message handler functions
  useEffect(() => {
    if (window.Worker) {
      worker.onmessage = (e) => {
        switch (e.data.status) {
          case 'initiate':
            setReady(false);
            setProgressItems(prev => [...prev, e.data]);
            break;
          case 'progress':
            setProgressItems(
              prev => prev.map(item => {
                if (item.file === e.data.file) {
                  return { ...item, progress: e.data.progress }
                }
                return item;
              })
            );
            break;
          case 'done':
            setProgressItems(
              prev => prev.filter(item => item.file !== e.data.file)
            );
            break;
          case 'ready':
            setReady(true);
            break;
          case 'complete':
            setReady(true);
            setOutput(e.data.output.neighbors);
            break;
        }
      };
    }
  }, [worker]);

  // Switch column fields based on the table
  const generateColDefinition = (idField, textField) => {
    return ([
      {
        field: idField,
        headerName: 'Record',
        width: 100,
        renderCell: (row) => <Link href={generateUrl(row.value)} target='_blank'>Open</Link>
      },
      {
        field: textField,
        headerName: 'Text',
        width: 950,
        sortable: true,
      },
    ]);
  }

  // Submit user query for semantic search
  const submitQuery = () => {
    if (input && input !== '') {
      setReady(false);
      worker.postMessage({
        action: 'search',
        data: input
      });
    } else {
      const reportColumns = generateColDefinition();
      setOutput(null);
      setData(reportData.data);
      setColumns(reportColumns);
    }

  }

  const generateUrl = (recordId) => {
    // URL generation ref: https://tririgafeedia.wordpress.com/2016/08/30/ux-is-there-a-way-to-use-smart-sections-to-open-records-in-ux/
    return `${appConfig.tririgaUrl}/WebProcess.srv?objectId=750000&actionId=750011&propertyId=208133&projectId=1&specClassType=7&specId=${recordId}&specTypeId=106402&action=Edit&managerType=query&altGuiListId=-1&inline=false`
  }

  return (
    <div>
      <div className="search-criteria">
        <input 
          placeholder="Enter Search Criteria" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' ? submitQuery() : null}
        />
        <button disabled={!ready} onClick={submitQuery}>Search</button>
      </div>
      {progressItems.length > 0 && <div className='progress-bars-container'>
        {ready === false && (
          <label>Loading AI Model...</label>
        )}
        {progressItems.map(data => (
          <div key={data.file}>
            <Progress text={data.file} percentage={data.progress} />
          </div>
        ))}
      </div>}
      <DataGrid
        rows={data}
        columns={columns}
        getRowId={(row) => row.id ? row.id : row.record_id}
        pageSizeOptions={[50]}
      />
    </div>
    
  );

}

export default SemanticSearch;