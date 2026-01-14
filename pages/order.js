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
    <div style={styles.menuGrid}>
  {menuList.map((menu) => {
    const qty = cart[menu.id]?.qty || 0;

    return (
      <div key={menu.id} style={styles.menuCard}>
        <div style={{ fontSize: 18, fontWeight: "bold" }}>
          {menu.name}
        </div>
        <div style={{ marginBottom: 10 }}>
          ${menu.price}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => {
              setCart((prev) => {
                if (!prev[menu.id]) return prev;
                const newQty = prev[menu.id].qty - 1;
                if (newQty <= 0) {
                  const copy = { ...prev };
                  delete copy[menu.id];
                  return copy;
                }
                return {
                  ...prev,
                  [menu.id]: { ...prev[menu.id], qty: newQty },
                };
              });
            }}
          >
            -
          </button>

          <span>{qty}</span>

          <button
            onClick={() => {
              setCart((prev) => ({
                ...prev,
                [menu.id]: {
                  id: menu.id,
                  name: menu.name,
                  price: menu.price,
                  qty: qty + 1,
                },
              }));
            }}
          >
            +
          </button>
        </div>
      </div>
    );
  })}
</div>
  );
}