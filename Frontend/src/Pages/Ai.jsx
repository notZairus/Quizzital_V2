import { useRef, useState } from "react"
import Heading1 from "../Components/Heading1";
import ButtonLarge from "../Components/ButtonLarge"
import { GoogleGenerativeAI } from "@google/generative-ai";
import Swal from 'sweetalert2';


export default function Ai() {
  const inputTextAreaRef = useRef(null);
  const [result, setResult] = useState("...");

  async function generateQuestion() {
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash" ,
        systemInstruction: "You are an instructor, extract 10 questions with an answer out of the text that will be provided by the user. Your answer should never be a html markdown, just plain text."
      });

      const prompt = inputTextAreaRef.current.value;

      const result = await model.generateContent(prompt);
      setResult(result.response.text());
    } catch(error) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input.'
      })
    }
    
  }

  return (
    <>
      <Heading1>Extract Quiz</Heading1>
      <div className="w-full my-4 h-[500px] flex gap-4">
        <div className="w-2/5 bg-white rounded-lg flex flex-col">
          <textarea ref={inputTextAreaRef} className="flex-1 resize-none p-4 py-3 text-lg outline-none" />
          <div className="flex justify-between px-4 py-4">
            <div className="flex flex-col space-y-2">
              <label>
                Type:
                <select required className="border ml-2">
                  <option value="multiple choice">Multiple Choice</option>
                  <option value="identification">Identification</option>
                </select>
              </label>
              <label>
                Number of Questions: 
                <input type="number" max="50" min="5" step="1" className="w-12 border ml-2"/>
              </label>
            </div>
            <ButtonLarge onClick={generateQuestion}>Generate Questionaire</ButtonLarge>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-lg flex flex-col relative">
          <div className="absolute right-8 top-4">
            <ButtonLarge>Copy</ButtonLarge>
          </div>
          <textarea readOnly={true} value={result} className="flex-1 resize-none p-4 py-3 text-xl outline-none" />
        </div>

      </div>
    </>
  )
}