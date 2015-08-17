#!/bin/bash
for i in `seq 0 7472`;
do
        curl -XDELETE localhost:9200/$i
done