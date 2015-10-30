/**
 * Created by ds on 30/10/15.
 */

var App = require("mplexviz-ngraph");

var data = '<?xml version="1.0"?>\n\
<!DOCTYPE graph SYSTEM "http://www.cs.rpi.edu/~puninj/XGMML/xgmml.dtd">\n\
<graph directed="0" id="42" label="Hello, I am a graph" >\n\
	<att id="layers" layers="2">\n\
		<att type="layer" id="1" />\n\
		<att type="layer" id="2" />\n\
	</att>\n\
	<node id="A" label="node 1" />\n\
	<node id="B" label="node 2" />\n\
	<node id="C" label="node 3" />\n\
	<node id="D" label="node 1" />\n\
	<node id="E" label="node 2" />\n\
	<node id="F" label="node 3" />\n\
	<edge source="A" target="B" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="A" target="C" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="A" target="D" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="A" target="E" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="A" target="F" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="B" target="C" label="Edge from node 2 to node 3" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="B" target="D" label="Edge from node 2 to node 3" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="B" target="E" label="Edge from node 2 to node 3" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="B" target="F" label="Edge from node 2 to node 3" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="C" target="D" label="Edge from node 3 to node 1" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="C" target="E" label="Edge from node 3 to node 1" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="C" target="F" label="Edge from node 3 to node 1" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="D" target="E" label="Edge from node 3 to node 1" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="D" target="F" label="Edge from node 3 to node 1" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="E" target="F" label="Edge from node 3 to node 1" >\n\
		<att sourcelayer="1" targetlayer="1"></att>\n\
	</edge>\n\
	<edge source="A" target="B" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="A" target="C" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="A" target="D" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="A" target="E" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="A" target="F" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="B" target="C" label="Edge from node 2 to node 3" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="B" target="D" label="Edge from node 2 to node 3" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="B" target="E" label="Edge from node 2 to node 3" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="B" target="F" label="Edge from node 2 to node 3" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="C" target="D" label="Edge from node 3 to node 1" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="C" target="E" label="Edge from node 3 to node 1" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="C" target="F" label="Edge from node 3 to node 1" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="D" target="E" label="Edge from node 3 to node 1" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="D" target="F" label="Edge from node 3 to node 1" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="E" target="F" label="Edge from node 3 to node 1" >\n\
		<att sourcelayer="2" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="A" target="A" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="1" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="B" target="B" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="1" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="C" target="C" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="1" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="D" target="D" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="1" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="E" target="E" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="1" targetlayer="2"></att>\n\
	</edge>\n\
	<edge source="F" target="F" label="Edge from node 1 to node 2" >\n\
		<att sourcelayer="1" targetlayer="2"></att>\n\
	</edge>\n\
</graph>';

var instance = new App({
    el: rootDiv,
    data: data,
    options: {
        inputFiles: 'xgmml'
    }
});

instance.render();


