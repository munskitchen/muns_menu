import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "../../lib/firebase";

export default function AdminMenu() {
  const router = useRouter();
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  // 🔐 관리자 로그인 체크
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/admin/login");
    });
    return () => unsub();
  }, []);

  // 📥 메뉴 불러오기
  const fetchMenus = async () => {
    const q = query(collection(db, "menu"), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    setMenus(
      snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    );
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // ➕ 메뉴 추가
  const addMenu = async () => {
    if (!name || !price) return alert("메뉴명/가격 입력");

    await addDoc(collection(db, "menu"), {
      name,
      price: Number(price),
      createdAt: new Date(),
      available: true,
    });

    setName("");
    setPrice("");
    fetchMenus();
  };

  // 💲 가격 수정
  const updatePrice = async (id, price) => {
    await updateDoc(doc(db, "menu", id), {
      price: Number(price),
    });
  };

  // ❌ 메뉴 삭제
  const deleteMenu = async (id) => {
    if (!confirm("삭제할까요?")) return;
    await deleteDoc(doc(db, "menu", id));
    fetchMenus();
  };

  // 🚫 판매중 / 품절
  const toggleAvailable = async (menu) => {
    await updateDoc(doc(db, "menu", menu.id), {
      available: !menu.available,
    });
    fetchMenus();
  };

  // 🔓 로그아웃
  const logout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📋 메뉴 관리</h1>

      <button onClick={logout} style={styles.logout}>
        로그아웃
      </button>

      <div style={styles.addBox}>
        <input
          placeholder="메뉴명"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="가격"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button onClick={addMenu}>추가</button>
      </div>

      {menus.map((menu) => (
        <div key={menu.id} style={styles.row}>
          <b>{menu.name}</b>

          <input
            type="number"
            defaultValue={menu.price}
            onBlur={(e) =>
              updatePrice(menu.id, e.target.value)
            }
          />

          <button onClick={() => toggleAvailable(menu)}>
            {menu.available ? "판매중" : "품절"}
          </button>

          <button
            onClick={() => deleteMenu(menu.id)}
            style={{ color: "red" }}
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: { padding: 30 },
  title: { fontSize: 28 },
  logout: {
    marginBottom: 20,
    background: "#000",
    color: "white",
    padding: 10,
  },
  addBox: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  row: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
};