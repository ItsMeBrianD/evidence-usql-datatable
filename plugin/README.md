# USQL Datatable Plugin

This plugin provides an improved datatable that leverages the functionality of Evidence's Universal SQL feature

## Installation

- Install the package (and ensure that it is saved)
  `npm i -s @brianmd/evidence-usql-datatable`
- Add the package to your `evidence.plugins.yaml` file, under components
- Check that this section exists in your `package.json` file, if missing, add it
  ```json
  "resolutions": {
    "@evidence-dev/universal-sql": "usql"
  },
  ```
  - This ensures that there is only one instance of the underlying DuckDB instance, so that dependencies (like this one)
    share with the Evidence project
