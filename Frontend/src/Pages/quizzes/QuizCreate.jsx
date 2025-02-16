import Heading1 from "../../Components/Heading1";
import Swal from 'sweetalert2';
import { useState } from "react";
import { nanoid } from 'nanoid';

export default function QuizCreate() {
  const [ multipleChoiceQuestions, setMultipleChoiceQuestions ] = useState([]);
  const [ idenficationQuestions, setIdenficationQuestions ] = useState([]);

  function showAi() {
    Swal.fire({
      title: 'Ai',
      html: `
          <textarea class="w-full h-80 border-2 border-black/20 resize-none p-4"> </textarea>
      `,
      confirmButtonText: 'Extract Questions'
    })
  }

  function addMultipleChoiceQuestion() {
    setMultipleChoiceQuestions([...multipleChoiceQuestions, {question: "", choices: [], answer_index: -1}])
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <Heading1>Create Quiz</Heading1>
        <button 
            className="bg-BackgroundColor_Darker text-white px-4 py-2 rounded font-semibold shadow"
            onClick={showAi}
          >
            Extract Questions
          </button> 
      </div>
      
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl mb-4">Multiple Choice</h1>
          <div className="space-y-2">
            {
              multipleChoiceQuestions.map((question, index) => (
                  <div key={index} className="w-full min-h-80 bg-white border-black border-2 flex rounded px-4 pt-2 pb-4 gap-4">
                    <div className="flex-1 flex flex-col">
                      <p className="text-xl mb-2">Question: </p>
                      <div className="h-full">
                        <textarea 
                          className="w-full font-lg py-2 px-4 h-full resize-none border rounded"
                          value={question.question} 
                          onChange={e => {
                            let allQuestions = [...multipleChoiceQuestions];
                            allQuestions[index].question = e.target.value;
                            setMultipleChoiceQuestions(allQuestions)
                          }}  
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xl mb-2">Choices: </p>
                      <div className="space-y-2">
                        <input type="text" className="w-full font-lg py-2 px-4 h-full resize-none border rounded"/>
                        <input type="text" className="w-full font-lg py-2 px-4 h-full resize-none border rounded"/>
                        <input type="text" className="w-full font-lg py-2 px-4 h-full resize-none border rounded"/>
                        <div>
                          <p className="mt-4">Answer: </p>
                          <input type="text" className="w-full font-lg py-2 px-4 h-full resize-none border rounded"/>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )
            }
            <div onClick={addMultipleChoiceQuestion} className="w-full h-20 bg-white/70 border-black/20 border-2 flex items-center rounded text-lg px-8 cursor-pointer">
              Add Multiple Choice Question
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl mb-4">Identifications</h1>
          <div className="w-full h-20 bg-white/70 border-black/20 border-2 flex items-center rounded text-lg px-8">
            Add Identification Question
          </div>
        </div>
      </div>
    </>
  )
}