import { useState } from "react";
import { useRouter } from "next/router";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const MENU = [
  { id: 1, name: "떡볶이", price: 7000 },
  { id: 2, name: "치즈 떡볶이", price: 8000 },
  { id: 3, name: "짜장 떡볶이", price: 8000 },
  { id: 4, name: "로제 떡볶이", price: 9000 },
];

export default function Order() {
  const router = useRouter();
  const { table } = router.query;

  const [cart, setCart] = useState({});

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
      table: table,
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
      <p>테이블 번호: {table}</p>

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