import { useState } from 'react'
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import './website.css'

function App() {

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY });
  const [request, setRequest] = useState("");
  const [response, setResponse] = useState("");
  const script = `Assess whether this website has low contrast text issues.
        Your response should look like this: "Score: [score from 0 to 100]. (next line) Areas to improve: (next line) 1. (one thing): (short precise explanation) ..." 
        Make sure to be precise and straight to the point.`;

  const handleChangeRequest = (event) => {
    setRequest(event.target.value);
  }

  async function aiURLAnalysis() {
    try {
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You need to analyze this website: ${request}. ${script}`
      });

      setResponse(aiResponse.text);
    } catch (error) {
      console.log(error)
      setResponse("There is some error, try again later.")
    }
  }

  async function aiScreenshotAnalysis() {
    try {
      const screenshotUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
      const base64Data = screenshotUrl.split(',')[1];

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [`You need to analyze this website from a screenshot. ${script}`,
        { inlineData: { data: base64Data, mimeType: "image/png" } }]
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
        <button className="go_button"
          onClick={() => {
            setResponse("Let me think...");
            aiTest()
          }}>
          Analyze the current website
        </button>
      </div>
      <div className='response'>
        <ReactMarkdown>{response}</ReactMarkdown>
      </div>
    </>
  )
}

export default App
