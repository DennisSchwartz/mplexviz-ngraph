/**
 * Created by ds on 14/12/15.
 */

var App = require("mplexviz-ngraph");

var data = 'source,layer,target,layer\n\
NFKB1,Transcriptional regulation,PRKCE,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PAG1,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PRKCH,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,MDS033,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PKN2,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PRKD1,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PRKCQ,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PRKCZ,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PRKG1,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PRKG2,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,MAPK4,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,MAPK8,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,MAPK9,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,MAPK10,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,MAP2K1,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,MAP2K2,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,MAP2K3,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,MAP2K5,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,MAP2K7,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,EIF2AK2,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PRKX,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PRLR,Transcriptional regulation\n\
hsa-mir-371,Post-transcriptional regulation,ACVR1B,Post-transcriptional regulation\n\
NFKB1,Transcriptional regulation,PSEN1,Transcriptional regulation\n\
hsa-mir-371,Post-transcriptional regulation,ACVR2A,Post-transcriptional regulation\n\
NFKB1,Transcriptional regulation,PAK6,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,DUSP22,Transcriptional regulation\n\
hsa-mir-371,Post-transcriptional regulation,NUMBL,Post-transcriptional regulation\n\
hsa-mir-371,Post-transcriptional regulation,ACVR2B,Post-transcriptional regulation\n\
NFKB1,Transcriptional regulation,CDC42SE2,Transcriptional regulation\n\
PPARG,Transcriptional regulation,POC1A,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,CAMK1D,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PAK7,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,SMURF1,Transcriptional regulation\n\
hsa-mir-371,Post-transcriptional regulation,ULK2,Post-transcriptional regulation\n\
hsa-mir-371,Post-transcriptional regulation,PPARA,Post-transcriptional regulation\n\
NFKB1,Transcriptional regulation,HT019,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,BIRC6,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PTH1R,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PTK2,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,KIDINS220,Transcriptional regulation\n\
hsa-mir-372,Post-transcriptional regulation,RPS6KB1,Post-transcriptional regulation\n\
NFKB1,Transcriptional regulation,RPTOR,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PTK6,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,SH3RF1,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PTPN2,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PTPN11,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PTPRA,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,PTPRE,Transcriptional regulation\n\
NFKB1,Transcriptional regulation,hsa-mir-371,Post-transcriptional regulation\n\
RPS6KB1,Post-transcriptional regulation,hsa-mir-371,Post-transcriptional regulation\n\
PPARG,Transcriptional regulation, NFKB1,Transcriptional regulation';

var instance = new App({
    el: rootDiv,
    data: data,
    options: {
        layout: 'Manual'
    }
});

instance.render();

