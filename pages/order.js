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
  const [menuList, setMenuList] = useState([]);
  const [cart, setCart] = useState({});

  /* ✅ 테이블 번호 읽기 */
  useEffect(() => {
    if (router.isReady) {
      setTable(router.query.table);
    }
  }, [router.isReady]);

  /* ✅ Firestore 메뉴 실시간 로드 */
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

  /* ✅ 수량 + */
  const addQty = (menu) => {
    setCart((prev) => ({
      ...prev,
      [menu.id]: {
        id: menu.id,
        name: menu.name,
        price: menu.price,
        qty: (prev[menu.id]?.qty || 0) + 1,
      },
    }));
  };

  /* ✅ 수량 - */
  const removeQty = (menu) => {
    setCart((prev) => {
      const currentQty = prev[menu.id]?.qty || 0;
      if (currentQty <= 1) {
        const copy = { ...prev };
        delete copy[menu.id];
        return copy;
      }
      return {
        ...prev,
        [menu.id]: {
          ...prev[menu.id],
          qty: currentQty - 1,
        },
      };
    });
  };

  /* ✅ 주문 저장 */
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

    alert(`테이블 ${table} 주문 완료`);
    setCart({});
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>주문 페이지</h1>
      <p style={styles.table}>테이블 번호: {table ?? "읽는 중..."}</p>

      <div style={styles.menuGrid}>
        {menuList.map((menu) => {
          const qty = cart[menu.id]?.qty || 0;

          return (
            <div key={menu.id} style={styles.menuCard}>
              <div style={styles.menuName}>{menu.name}</div>
              <div style={styles.menuPrice}>${menu.price}</div>

              <div style={styles.qtyRow}>
                <button onClick={() => removeQty(menu)}>-</button>
                <span>{qty}</span>
                <button onClick={() => addQty(menu)}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      <button style={styles.orderButton} onClick={submitOrder}>
        주문하기
      </button>
    </div>
  );
}

/* 🎨 스타일 */
const styles = {
  page: {
    padding: 30,
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
  },
  table: {
    fontSize: 18,
    marginBottom: 20,
  },
  menuGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  menuCard: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
  },
  menuName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  menuPrice: {
    color: "#0070f3",
    marginBottom: 10,
  },
  qtyRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  orderButton: {
    marginTop: 30,
    width: "100%",
    padding: 16,
    fontSize: 20,
  },
};