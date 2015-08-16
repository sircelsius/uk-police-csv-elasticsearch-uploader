# UK Police data to Elasticsearch uploader

Read a bunch of csv files (the [UK Police](https://data.police.uk/data/) provides one file per precinct per month) that have a similar structure and upload them to an Elasticsearch cluster to be bale to further analyse them.

## Quick usage

```
npm install
node uploader.js
```

This will read all the files within the `input` folder and try to upload them to a `uk_police` index on an elasticsearch instance running on `localhost:9200`.

### Available options:

  * `-f` or `--filename`: provide the path to a single CSV file to upload to ES.
  * `-h` or `--host`: give the host of the ES instance to upload to.
  * `-p` or `--port`: the port of the ES instance.

## Structure

  * [utils/csvReader.js](utils/csvReader.js): reads a CSV file.
  * [utils/esUploader.js](utisl/csvReader.js): uploads content to an ES cluster.
  * [uploader.js](app.js): combines both of the above tasks to batch upload documents.