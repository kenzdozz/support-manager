import fs from 'fs';
import htmlPdf from 'html-pdf';

const CSV = (data: Array<object>): Buffer => {
    const fields = Object.keys(data[0]).join(',');
    const records = data.map(item => {
        return Object.values(item).join(',');
    })
    records.unshift(fields);
    const result = records.join('\r\n') 
    
    return Buffer.from(result, 'utf8');
}

const PDF = async (data: Array<object>, title: string): Promise<Buffer> => {
    const fields = Object.keys(data[0]);

    const head = `<head><style>
        *{margin:0;box-sizing:border-box;}
        body{margin:1rem}
        h3{margin: 1.5rem 0;text-align:center;font-size:11px;}
        table{margin:0;width: 100%;text-align: center;border-collapse: collapse;font-size:9px;}
        thead{background-color: darkgray;}
        tr{margin:0;}
        td,th{margin:0;padding: 0.3rem;border: 1px solid;}
        </style></head>
    `;
    const th = `<thead><tr>${fields.map(f => `<th>${f}</th>`).join('')}</tr></thead>`;
    const tb = `<tbody>${data.map(item => `<tr>${Object.values(item).map(f => `<td>${f}</td>`).join('')}</tr>`).join('')}`;
    const html = `<html>${head}<body><h3>${title}<h3><table>${th}${tb}</table></body></html>`;

    const pdfMaker = async (html: string) => new Promise((resolve, reject) => {
        htmlPdf.create(html, { format: 'A4', orientation: 'landscape' }).toBuffer(function (err, buffer) {
            return err ? reject(err) : resolve(buffer)
        });
    })
    
    const buffer = await pdfMaker(html);
    return <Buffer>buffer;
}

export { PDF, CSV };
