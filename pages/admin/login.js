import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/menu");
    } catch (err) {
      alert("로그인 실패");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>관리자 로그인</h1>

      <input
        placeholder="이메일"
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="비밀번호"
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 20 }}
      />

      <button onClick={login}>로그인</button>
    </div>
  );
}