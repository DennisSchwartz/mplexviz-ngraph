# mplexviz-ngraph

[![NPM version](http://img.shields.io/npm/v/mplexviz-ngraph.svg)](https://www.npmjs.org/package/mplexviz-ngraph) 

>  A visualisation module for multilayer networks as modelled by [mplexnet](https://github.com/DennisSchwartz/mplexnet)
 using [ngraph.three](https://github.com/anvaka/ngraph.three).

## Getting Started
This is a visualisation module for multilayer network data. It is still very much work in progress so beware 
of updates  as your code might break.

You can install the module with: `npm install mplexviz-ngraph`

To test it, try something like this:

```javascript
var Viz = require('mplexviz-ngraph');

var data = 'source,l1,l2,target,l1,l2\n1,A,X,2,A,X\n1,A,X,1,B,X\n1,A,X,4,B,X\n1,B,X,1,B,Y\n1,B,X,3,B,X\n\
           1,B,X,4,B,X\n3,B,X,4,B,X\n4,B,X,3,A,Y\n3,A,Y,3,A,X\n3,A,Y,2,A,Y';
           
var instance = new Viz({
    el: rootDiv,
    data: data
});

instance.render();

```

## Specifying options

You can specify some options for the mplexnet module. It is mostly setting options for the data input. 

```javascript

/*
 * These are the default options for a network
 *
 *   Log levels:
 *       1: Errors and important info
 *       2: More info
 *       3: Detail debug messages incl. data
 */
var options = {
    inputFiles: 'single',
    inputFileDelimiter: ',',
    sourceFieldLabel: 'source',
    targetFieldLabel: 'target',
    loglevel: 0
};

var instance = new Viz({
    el: rootDiv,
    data: data,
    options: options
});

instance.render();

```

## Input format

There will be more detailed description of the input format soon.

For now, there are two possible ways to pass data:

* A single csv data object of edges between node-layer objects
```
source,l1,l2,target,l1,l2
1,A,X,2,A,X
1,A,X,1,B,X
1,A,X,4,B,X
1,B,X,1,B,Y
1,B,X,3,B,X
1,B,X,4,B,X
3,B,X,4,B,X
4,B,X,3,A,Y
3,A,Y,3,A,X
3,A,Y,2,A,Y
```
* Three separate files/objects 
    * A list of aspects
    ```
    Time
    ```
    * A list of node-layer objects with a unique id
    ```
    id,Time,name
    1,now,1
    2,now,2
    3,now,3
    4,now,4
    5,then,1
    6,then,2
    7,then,3
    8,then,4
    ```
    * A list of edges between these ids
    ```source, target
       1, 4
       2, 3
       2, 4
       1, 5
       2, 6
       3, 8
       4, 8
       5, 6
       5, 7
       6, 7
   
    ```


## Contributing

All contributions are welcome.

## Support

If you have any problem or suggestion please open an issue [here](https://github.com/DennisSchwartz/mplexviz-ngraph/issues).

## License 

The MIT License

Copyright (c) 2015, Dennis Schwartz

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
