import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export default function Order() {
  const router = useRouter();
  const [table, setTable] = useState(null); // 🔥 핵심
  const [cart, setCart] = useState({});
  const [menuList, setMenuList] = useState([]);

  // 🔥 router 준비된 후 table 읽기
  useEffect(() => {
    if (router.isReady) {
      setTable(router.query.table);
    }
  }, [router.isReady]);

    // 🔥 2-4 메뉴 불러오기
  useEffect(() => {
    const q = query(
      collection(db, "menu"),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuList(data);
    });

    return () => unsubscribe();
  }, []);

  const addQty = (menu) => {
    setCart((prev) => ({
      ...prev,
      [menu.id]: {
        ...menu,
        qty: (prev[menu.id]?.qty || 0) + 1,
      },
    }));
  };

  const removeQty = (menu) => {
    setCart((prev) => {
      const qty = (prev[menu.id]?.qty || 0) - 1;
      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[menu.id];
        return copy;
      }
      return {
        ...prev,
        [menu.id]: { ...menu, qty },
      };
    });
  };

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

      <div style={styles.menuGrid}>
        {menuList.map((menu) => (
          <button
            key={menu.id}style={styles.menuButton}
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

      <h1>주문 페이지</h1>
      <p>테이블 번호: {table ?? "읽는 중..."}</p>

      {MENU.map((menu) => (
        <div
          key={menu.id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            marginBottom: 10,
          }}
        >
          <strong>{menu.name}</strong> ({menu.price}원)
          <div style={{ marginTop: 8 }}>
            <button onClick={() => removeQty(menu)}>-</button>{" "}
            {cart[menu.id]?.qty || 0}{" "}
            <button onClick={() => addQty(menu)}>+</button>
          </div>
        </div>
      ))}

      <button
        onClick={submitOrder}
        style={{ marginTop: 20, fontSize: 18 }}
      >
        주문하기
      </button>
    </div>
  );
}