# TRIRIGA Semantic Search

This is a quick proof of concept (POC) written that allows the user to pick a query and perform semantic search on the results. The top five results are returned (in order of similarity).

This project is inspired by [SemanticFinder](https://github.com/do-me/SemanticFinder).

Read more about this UX application in my [blog post](https://karbasi.dev/blog/performing-semantic-search-on-unstructured-tririga-data).

# Installation Instructions

1. Create a new UX Web View with type `WEB_APP`
1. Set the Root folder value to `dist` and index filename to `index.html`
1. Create a Model & View record with the newly created view and any model
1. Create a new application record withthe M&V from above and the exposed name `semanticSearch` and an instance ID of `-1`
1. Clone this repository
1. Run `npm install` to install dependencies
1. Run `npm run build` to create the final distribution files under the `dist` folder
1. Deploy the code using the command `npx @tririga/tri-deploy -u <USER> -p <PASS> -v <VIEW_EXPOSED_NAME> -t <TRIRIGA> -v -m 3`
1. Navigate to `<TRIRIGA>/app/semanticSearch` to view the application

# POC Notes

1. I tested this code on my own sample data. Please open an issue if there are any issues with a TRIRIGA backend
1. Only queries with the tag `Semantic` should appear in the report list. This is hardcoded for the POC
1. The query MUST only contain one text field for semantic search. This is hardcoded to reduce POC complexity
1. Only the first 1000 rows of the query generate embeddings. This is to reduce the memory usage
1. Environments with context paths MAY require additional tweaks to the code. Send me a note if you are experiencing issues and we can debug this together
1. My sample data is provided in the file `lease_clauses.md`