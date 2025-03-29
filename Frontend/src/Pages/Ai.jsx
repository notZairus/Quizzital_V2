import { useRef, useState } from "react"
import Heading1 from "../Components/Heading1";
import ButtonLarge from "../Components/ButtonLarge"
import Button from "../Components/Button"
import { GoogleGenerativeAI } from "@google/generative-ai";
import Swal from 'sweetalert2';


export default function Ai() {
  const inputTextAreaRef = useRef(null);
  const outputTextAreaRef = useRef(null);
  const questionTypeRef = useRef(null);
  const questionCountRef = useRef(null);

  const [result, setResult] = useState("...");
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  async function generateQuiz(e) {
    e.preventDefault();
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash" ,
        systemInstruction: `You are an instructor, extract ${questionCountRef.current.value} ${questionTypeRef.current.value} questions with an answer out of the text that will be provided by the user. Your answer should never be a html markdown, just plain text.`
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

  function copyQuiz() {
    let quiz = outputTextAreaRef.current.value;
    navigator.clipboard.writeText(quiz);
    setGeneratedQuiz(quiz)
  }

  return (
    <>
      <Heading1>Generate Questionnaire</Heading1>
      <div className="w-full my-4 h-[500px] flex gap-4">
        <form onSubmit={generateQuiz} className="w-2/5 bg-white rounded flex flex-col border">
          <textarea ref={inputTextAreaRef} className="flex-1 resize-none p-4 py-3 text-lg outline-none rounded" />
          <div className="flex justify-between px-4 py-4">
            <div className="flex flex-col space-y-2">
              <label>
                Type:
                <select ref={questionTypeRef} required className="border ml-2">
                  <option value="multiple choice">Multiple Choice</option>
                  <option value="identification">Identification</option>
                </select>
              </label>
              <label>
                Number of Questions: 
                <input ref={questionCountRef} type="number" max="50" min="5" step="1" className="w-12 border ml-2" required/>
              </label>
            </div>
            <ButtonLarge>Generate Questionaire</ButtonLarge>
          </div>
        </form>
        <div className="flex-1 bg-white flex flex-col relative border rounded">
          <div className="absolute right-8 top-4">
            <Button onClick={copyQuiz}>{generatedQuiz ? "Copied" : "Copy"}</Button>
          </div>
          <textarea ref={outputTextAreaRef} readOnly={true} value={result} className="flex-1 resize-none p-4 py-3 text-xl outline-none rounded " />
        </div>

      </div>
    </>
  )
}