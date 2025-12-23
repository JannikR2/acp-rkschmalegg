import axios from 'axios'
import { useState, useEffect } from 'react'
import './App.css'

function App() {  
  const [message, setMessage] = useState('')

  useEffect(() => {
    axios.get('http://localhost:3000/')
      .then(response => {
        setMessage(response.data.message)
      })
      .catch(error => {
        console.error('There was an error fetching the message!', error)
      })
  }, [])

  return (
    <>
      <header className="App-header">
        <h1>Zeiterfassung RK Schmalegg</h1>
      </header>
      <main>
        <div>{message}</div>
      </main>
    </>
  )
}

export default App
