import { useEffect, useState } from 'react'
import { GoogleGenAI } from "@google/genai";
import './App.css'

function App() {

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY });
  const [request, setRequest] = useState("");
  const [response, setResponse] = useState("")

  const handleChangeRequest = (event) => {
    setRequest(event.target.value);
  }

  async function aiTest() {

    try {
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You need to analyze this website and assess whether this website has low contrast text issues: ${request} `,
      });

      setResponse(aiResponse.text);
    } catch (error) {
      console.log(error)
      setResponse("There is some error, try again later.")
    }

  }

  return (
    <>
      <div>
      </div>
      <h1>Test</h1>
      <input
        type="text"
        id="request"
        value={request}
        onChange={handleChangeRequest}
      />
      <button onClick={() => {
        setResponse("Let me think...");
        aiTest()
      }}>
        GO
      </button>

      <div>{response}</div>
    </>
  )
}

export default App
