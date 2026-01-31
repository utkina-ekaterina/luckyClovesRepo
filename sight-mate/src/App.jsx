import { useEffect, useState } from 'react'
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import './website.css'

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
        contents: `You need to analyze this website and assess whether this website has low contrast text issues: ${request}.
        Make sure to be precise and short, without tables. Be straight to the point. `,
      });

      setResponse(aiResponse.text);
    } catch (error) {
      console.log(error)
      setResponse("There is some error, try again later.")
    }

  }

  return (
    <>
      <h1>S i g h t M a t e</h1>
      <p>SightMate is an AI bot that helps analyze any website to make them more accessible for users with disabilities.</p>
      <p>Input the website link</p>

      <div className="con">
        <div className="searchBar">
          <input
            type="text"
            id="request"
            value={request}
            onChange={handleChangeRequest}
          />
        </div>
        <button className="go_button"
          onClick={() => {
            setResponse("Let me think...");
            aiTest()
          }}>
          GO
        </button>
      </div>
      <div className='con'>
        <ReactMarkdown>{response}</ReactMarkdown>
      </div>
    </>
  )
}

export default App
