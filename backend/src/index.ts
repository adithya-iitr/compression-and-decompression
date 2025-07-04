import express from 'express'
import cors from 'cors'
import path from 'path';
import uploadRoutes from './routes/upload';
import compressRoutes from './routes/compress'
import downloadRoute from './routes/download'
import decompressRoute from './routes/decompress'
const port=process.env.PORT || 8000;
const app=express()
app.use(cors());
app.use(express.json())
app.use('/api', uploadRoutes);
app.use('/api', compressRoutes)
app.use('/api', downloadRoute)
app.use('/api', decompressRoute)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend', 'dist', 'index.html'));
});
app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})
