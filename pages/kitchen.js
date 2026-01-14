import { useEffect, useState, useRef } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const audioRef = useRef(null);
  const prevCookingCount = useRef(0);
  const audioUnlocked = useRef(false);
  
  //시간표시 추가
  const formatTime = (timestamp) => {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

  useEffect(() => {
    audioRef.current = new Audio("/order.mp3");
    audioRef.current.volume = 1.0;

    // ✅ [추가] iOS 오디오 unlock (최초 1회 터치)
    const unlockAudio = async () => {
      try {
        await audioRef.current.play();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioUnlocked.current = true;
        document.removeEventListener("touchstart", unlockAudio);
      } catch (e) {}
    };

    document.addEventListener("touchstart", unlockAudio);

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const cookingCount = data.filter((o) => o.status === "cooking").length;
      if (
        audioUnlocked.current &&
        cookingCount > prevCookingCount.current
      ) {
        audioRef.current.play().catch(() => {});
      }
   
      prevCookingCount.current = cookingCount;

      setOrders(data);
    });

    return () => unsubscribe();
  }, []);

  const completeOrder = async (id) => {
    await updateDoc(doc(db, "orders", id), {
      status: "completed",
    });
  };
  const cancelOrder = async (id) => {
    await updateDoc(doc(db, "orders", id), {
      status: "canceled",
    });
  };
  
  const cookingOrders = orders.filter(
    (o) => o.status === "cooking"
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🍳 주방 주문 현황</h1>

      {cookingOrders.length === 0 && (
        <p style={styles.empty}>조리 중인 주문이 없습니다</p>
      )}

      <div style={styles.grid}>
        {orders
          .filter((o) => o.status === "cooking")
          .map((order) => (
            <div key={order.id} style={styles.card}>
              <div style={styles.header}>
                <span style={styles.table}>
                  테이블 {order.table}
                </span>
              </div>

              <div style={{ opacity: 0.6, marginBottom: 6 }}>
                주문시간: {formatTime(order.createdAt)}
              </div>

              <ul style={styles.items}>
                {order.items.map((item, idx) => (
                  <li key={idx} style={styles.item}>
                    {item.name} × {item.qty}
                  </li>
                ))}
              </ul>

              <button
                style={styles.done}
                onClick={() => completeOrder(order.id)}
              >
                완료
              </button>

              <button
                style={{
                  ...styles.done,
                  marginTop: 10,
                  backgroundColor: "#ff5252",
                }}
                onClick={() => completeOrder(order.id)}
              >
                취소
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
    backgroundColor: "#111",
    minHeight: "100vh",
    color: "white",
  },
  title: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: 20,
  },
  empty: {
    textAlign: "center",
    fontSize: 24,
    opacity: 0.6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#222",
    borderRadius: 12,
    padding: 20,
  },
  header: {
    marginBottom: 10,
  },
  table: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00e0ff",
  },
  items: {
    listStyle: "none",
    padding: 0,
    fontSize: 20,
    marginBottom: 20,
  },
  item: {
    marginBottom: 6,
  },
  done: {
    width: "100%",
    padding: 16,
    fontSize: 22,
    backgroundColor: "#00c853",
    border: "none",
    borderRadius: 8,
    color: "black",
  },
};