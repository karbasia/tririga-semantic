import { pipeline, env } from '@xenova/transformers';
const voy = import('voy-search');

// This is required for proper loading of the model
env.allowLocalModels = false;
env.useBrowserCache = false;

// Base class where we can define the pipeline and vector index
class EmbeddingPipeline {
  static instance = null;
  static index = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { progress_callback });
    }

    return this.instance;
  }

  // Iterate through the report data, embed the text and store it in the vector index
  static async createEmbeddings(reportData, header, embedder) {
    const data = await Promise.all(reportData.map(async (row) => {
      const embeddings = await embedder(row[header], { pooling: 'mean', normalize: true });

      return {
        id: row.record_id,
        title: row[header],
        url: row.record_id,
        embeddings: Array.from(embeddings['data'])
      }
    }));
    
    this.index = new (await voy).Voy({ embeddings: data });

  }

  static getIndex() {
    return this.index;
  }
}

// Worker message handler
self.addEventListener('message', async (e) => {
  const embedder = await EmbeddingPipeline.getInstance(x => self.postMessage(x));

  if (e.data.action === 'embed') {
    // Embed the data and store it in the vector DB
    await EmbeddingPipeline.createEmbeddings(e.data.data, e.data.header, embedder);
    self.postMessage({
      status: 'ready'
    });
  } else if (e.data.action === 'search') {
      const output = await embedder(e.data.data, { pooling: 'mean', normalize: true });
      const index = EmbeddingPipeline.getIndex();

      if (index) {
        const results = index.search(output['data'], 5);
        self.postMessage({
          status: 'complete',
          output: results
        });
      } else {
        self.postMessage({
          status: 'error',
          text: 'Could not initialize vector database'
        });
      }
  }
});

export {};