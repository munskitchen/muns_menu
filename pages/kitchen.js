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

  // 🔔 오디오
  const audioRef = useRef(null);
  const audioUnlocked = useRef(false);
  const prevCookingCount = useRef(0);

  /* =====================
     ⏰ 시간 관련 함수
  ===================== */

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const elapsedMinutes = (timestamp) => {
    if (!timestamp?.toDate) return 0;
    return Math.floor(
      (Date.now() - timestamp.toDate().getTime()) / 60000
    );
  };

  /* =====================
     🔒 화면 꺼짐 방지
  ===================== */
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          if (wakeLock) await wakeLock.release();
          wakeLock = await navigator.wakeLock.request("screen");
          console.log("🔒 WakeLock 활성화");
        }
      } catch (e) {
        console.log("WakeLock 실패", e);
      }
    };

    requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (wakeLock) wakeLock.release();
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  /* =====================
     🔔 오디오 + 주문 리스너
  ===================== */
  useEffect(() => {
    audioRef.current = new Audio("/order.mp3");
    audioRef.current.volume = 1.0;

    // iOS 오디오 unlock
    const unlockAudio = async () => {
      try {
        await audioRef.current.play();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioUnlocked.current = true;
        document.removeEventListener(
          "touchstart",
          unlockAudio
        );
      } catch {}
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

      const cookingCount = data.filter(
        (o) => o.status === "cooking"
      ).length;

      // 🔔 새 주문 알림
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

  /* =====================
     ✅ 상태 변경
  ===================== */
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

  /* =====================
     🖥 UI
  ===================== */
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🍳 주방 주문 현황</h1>

      {cookingOrders.length === 0 && (
        <p style={styles.empty}>
          조리 중인 주문이 없습니다
        </p>
      )}

      <div style={styles.grid}>
        {cookingOrders.map((order) => {
          const elapsed = elapsedMinutes(order.createdAt);
          const danger = elapsed >= 10;

          return (
            <div
              key={order.id}
              style={{
                ...styles.card,
                border: danger
                  ? "3px solid #ff5252"
                  : "3px solid transparent",
              }}
            >
              <div style={styles.header}>
                <span style={styles.table}>
                  테이블 {order.table}
                </span>
              </div>

              <div style={styles.time}>
                주문시간: {formatTime(order.createdAt)}
              </div>

              <div
                style={{
                  fontSize: 16,
                  color: danger ? "#ff5252" : "#aaa",
                  marginBottom: 10,
                }}
              >
                경과: {elapsed}분
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
                  backgroundColor: "#ff5252",
                  marginTop: 10,
                }}
                onClick={() => cancelOrder(order.id)}
              >
                취소
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =====================
   🎨 스타일
===================== */
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
    marginBottom: 6,
  },
  table: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00e0ff",
  },
  time: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 6,
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