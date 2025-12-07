import {questionList} from "./qlist.js"
import './style.css'

function randomInt(min, max) { // simpler syntax for the random
  let difference = max - min;
  if (Math.floor((Math.random()*difference))+min !== NaN) {
    return Math.floor((Math.random()*difference))+min;
  }
  else {
    return 0;
  }
}

function putQuestionOnScreen() {
  let questionId = randomInt(1, questionList.length);
  let targetQuestion = questionList[questionId];

  const resultsContainer = document.getElementById("results__container");
  resultsContainer.innerHTML = "";

  const questionContainer = document.getElementById("question__container");
  questionContainer.innerHTML = "";
  questionContainer.insertAdjacentHTML("beforeend", 
    `
    <h2 class="question__title"> ${targetQuestion.frontSide} </h2>
    `
  );

  let correctAnswer = targetQuestion.backSide;
  insertAnswers(correctAnswer, questionId);
}

function createEmptyForm() {
  const answerChoices = document.getElementById("answers__container");
  answerChoices.innerHTML = "";
  answerChoices.insertAdjacentHTML("afterbegin", `
    <form class="answers__form" id="answersForm">
      <h2 class="answers__title"> Select the correct answer. </h2>
      <div class="horizontal-line"></div>
      <div class="answer-buttons__container">
      
      </div>
      <input class="answers__submit-button" type="submit" value="CONFIRM"/>
    </form>
    `)
}

function insertAnswers(correctAnswer, questionId) {
  createEmptyForm();
  let answerChoiceNumber = randomInt(0, 3);

  const answersContainer = document.querySelector(".answer-buttons__container");

  let usedIds = [];
  usedIds.push(questionId)
  for (let i = 0; i < 4; i++) {
    if (i === answerChoiceNumber) {
      answersContainer.insertAdjacentHTML(
        "beforeend",
        `<button type="button" class="answer-btn" data-answer="${correctAnswer}">
          ${correctAnswer}
        </button>`
      );
    } else {
      let wrongAnswerId = randomInt(0, questionList.length);
      while(usedIds.find((id) => id===wrongAnswerId)) {
        wrongAnswerId = randomInt(0, questionList.length);
      }
      usedIds.push(wrongAnswerId);
      let wrongAnswer = questionList[wrongAnswerId].backSide;
      answersContainer.insertAdjacentHTML("beforeend",
        `<button type="button" class="answer-btn" data-answer="${wrongAnswer}">
          ${wrongAnswer}
        </button>`) 
    }
  }

  let selectedAnswer = "";
  const answerButtons = document.querySelectorAll(".answer-btn");
  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      answerButtons.forEach((button) => {
        button.classList.remove("selected");
      })
      button.classList.add("selected");
      selectedAnswer = button.getAttribute("data-answer");
    })
  })

  const answerForm = document.getElementById("answersForm");
  answerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if(selectedAnswer) {
      checkAnswer(questionId, correctAnswer, selectedAnswer);
    }
  })
}

function checkAnswer(questionId, correctAnswer, selectedAnswer) {
  const questionContainer = document.getElementById("question__container");
  questionContainer.innerHTML = "";

  const answerForm = document.getElementById("answersForm");
  answerForm.innerHTML = "";

  const resultsContainer = document.getElementById("results__container");

  if(correctAnswer === selectedAnswer) {
    resultsContainer.insertAdjacentHTML("beforeend", `
      <div class="correct-answer showAnswerAnimation">
      <h2 class="result-text"> CORRECT! </h2>
      <h2 class="result-text"> Question: ${questionList[questionId].frontSide} </h2>
      <h2 class="result-text"> Answer: ${correctAnswer} </h2>
      </div>
      `)
    const answerDiv = document.querySelector(".showAnswerAnimation");
    answerDiv.addEventListener("animationend", () => {
    answerDiv.classList.remove("showAnswerAnimation")
    })
  }
  else {
    resultsContainer.insertAdjacentHTML("beforeend", `
      <div class="incorrect-answer showAnswerAnimation">
      <h2 class="result-text"> INCORRECT! </h2>
      <h2 class="result-text"> Question: ${questionList[questionId].frontSide} </h2>
      <h2 class="result-text"> Correct Answer: ${correctAnswer} </h2>
      <h2 class="result-text"> You Selected: ${selectedAnswer} </h2>
      </div>
      `)
    const answerDiv = document.querySelector(".showAnswerAnimation");
    answerDiv.addEventListener("animationend", () => {
      answerDiv.classList.remove("showAnswerAnimation")
    })
  }
}

const nextQuestionButton = document.getElementById("next-question");
nextQuestionButton.addEventListener("click", () => {
  putQuestionOnScreen();
})