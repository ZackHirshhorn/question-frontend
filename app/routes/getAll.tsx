import React, { useEffect, useState } from "react";
import axiosClient from "../api/axios";

const GetAll = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [template, setTemplate] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/api/template/686cf7a5154dbdd8cb162844")
      .then((res) => {
        setTemplate(res.data.template || null);
        setLoading(false);
      })
      .catch((err) => {
        setError("שגיאה בטעינת השאלון");
        console.log(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">שאלון</h2>
      {template ? <div>{template.name}</div> : <div>לא נמצא שאלון</div>}
    </div>
  );
};

export default GetAll;
