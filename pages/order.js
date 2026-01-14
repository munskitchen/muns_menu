import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export default function Order() {
  const router = useRouter();
  const [table, setTable] = useState(null);
  const [cart, setCart] = useState({});
  const [menuList, setMenuList] = useState([]);

  // 테이블 번호 읽기
  useEffect(() => {
    if (router.isReady) {
      setTable(router.query.table);
    }
  }, [router.isReady, router.query.table]);

  // 메뉴 실시간 불러오기
  useEffect(() => {
    const q = query(collection(db, "menu"), orderBy("order", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuList(data);
    });

    return () => unsubscribe();
  }, []);

  const submitOrder = async () => {
    if (!table) {
      alert("테이블 번호 없음");
      return;
    }

    const items = Object.values(cart);
    if (items.length === 0) {
      alert("메뉴를 선택하세요");
      return;
    }

    await addDoc(collection(db, "orders"), {
      table,
      items,
      status: "cooking",
      createdAt: serverTimestamp(),
    });

    alert(`테이블 ${table} 주문 저장됨`);
    setCart({});
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>주문 페이지</h1>
      <p>테이블 번호: {table ?? "읽는 중..."}</p>

      <div>
        {menuList.map((menu) => (
          <button
            key={menu.id}
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              marginBottom: 10,
              border: "1px solid #ddd",
            }}
            onClick={() => {
              setCart((prev) => ({
                ...prev,
                [menu.id]: {
                  id: menu.id,
                  name: menu.name,
                  price: menu.price,
                  qty: (prev[menu.id]?.qty || 0) + 1,
                },
              }));
            }}
          >
            <div>{menu.name}</div>
            <div>${menu.price}</div>
          </button>
        ))}
      </div>

      <button
        onClick={submitOrder}
        style={{ marginTop: 20, fontSize: 18 }}
      >
        주문하기
      </button>
    </div>
  );
}