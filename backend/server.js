import express from 'express'
import cors from 'cors'


const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
}

const app = express()

app.use(cors(corsOptions))

app.get('/', (req, res) => {
  res.json({ message: 'Hello from server!' })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})