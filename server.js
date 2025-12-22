import http from "http";
import fs from "fs";

const PORT = process.env.PORT || 3000;

http.createServer((req,res)=>{
  if(req.url==="/"){
    res.writeHead(200,{"Content-Type":"text/html"});
    return res.end(fs.readFileSync("./public/link.html"));
  }
  if(req.url==="/admin/login"){
    res.end(fs.readFileSync("./public/login.html"));
    return;
  }
  if(req.url==="/admin"){
    res.end(fs.readFileSync("./public/admin.html"));
    return;
  }
  res.writeHead(404);res.end("Not Found");
}).listen(PORT);
