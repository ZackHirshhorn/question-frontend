import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "~/store";
import { fetchQuestionnaires } from "~/questionnaires/questionnaireSlice";

const QuestionnaireList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { questionnaires, loading, error } = useAppSelector(
    (state) => state.questionnaires
  );
  const userId = useAppSelector((state) => state.auth.userId);

  useEffect(() => {
    if (userId) {
      dispatch(fetchQuestionnaires(userId));
    }
  }, [dispatch, userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Questionnaires</h2>
      {questionnaires.length === 0 ? (
        <p>You have not created any questionnaires yet.</p>
      ) : (
        <ul>
          {questionnaires.map((q) => (
            <li key={q.id} className="mb-2 p-2 border rounded">
              <h3 className="font-bold">{q.title}</h3>
              <p>{q.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionnaireList;
