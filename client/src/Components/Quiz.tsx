import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Difficulty, Question } from "../types";
import Modal from "./Modal";
import { auth, db } from "../firebase";
import { doc, increment, updateDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";

const Quiz: React.FC = () => {
  // const user = auth.currentUser;
  const { difficulty } = useParams<{ difficulty: Difficulty }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setcurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  //5問目を判別する
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  //難易度別に問題のデータを取り出す
  useEffect(() => {
    fetch(`/api/questions/${difficulty}`)
      .then((responce) => responce.json())
      .then((data) => setQuestions(data));
  }, [difficulty]);

  const handleAnswer = (selctedAnswer: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const correct = selctedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowModal(true);
    if (correct) {
      setScore(score + 1);
    }
  };

  const nextQuesion = () => {
    setShowModal(false);
    setShowExplanation(false);
    if (currentQuestionIndex < questions.length - 1) {
      setcurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        const newTotalGames = (userData?.totalGames || 0) + 1;
        const newTotalScore = (userData?.totalScore || 0) + score;
        const newAverageScore = newTotalScore / newTotalGames;
        await updateDoc(userRef, {
          totalGames: increment(1),
          totalScore: increment(score),
          averageScore: newAverageScore,
        });
      } catch (error) {
        console.error("スコアのupdateに失敗しました", error);
      }
    }
    navigate("/complete", { state: { score, total: questions.length } });
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div>
      <h2>
        問題{currentQuestionIndex + 1}/{questions.length}
      </h2>
      <p>{currentQuestion?.text}</p>
      {currentQuestion?.options.map((option, index) => (
        <button key={index} onClick={() => handleAnswer(index)}>
          {option}
        </button>
      ))}
      <Modal
        show={showModal}
        onClose={() => setShowExplanation(false)}
        explanation={false}
      >
        <h3>{isCorrect ? "正解！" : "不正解"}</h3>
        <p>
          {isCorrect
            ? isLastQuestion
              ? "これでクイズは終了です！"
              : "次の問題に進みましょう！"
            : `正解は: ${
                currentQuestion?.options[currentQuestion.correctAnswer]
              }`}
        </p>
        <button onClick={nextQuesion}>
          {isLastQuestion ? "リザルト画面へ" : "次の問題へ"}
        </button>
        <button onClick={() => setShowExplanation(true)}>解説を見る</button>
      </Modal>
      <Modal show={showExplanation} onClose={nextQuesion} explanation={true}>
        <h3>解説</h3>
        <p>{currentQuestion?.explanation}</p>
      </Modal>
    </div>
  );
};
export default Quiz;
