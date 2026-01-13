import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRAdmin() {
  const TABLE_COUNT = 15;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // ⬅️ 핵심: 서버 렌더링 차단

  return (
    <div style={{ padding: 40 }}>
      <h1>테이블 QR 코드</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {Array.from({ length: TABLE_COUNT }).map((_, idx) => {
          const tableNumber = idx + 1;
          const url = `https://muns-menu.verce.app/order?table=${tableNumber}`;

          return (
            <div
              key={tableNumber}
              style={{
                border: "1px solid #ccc",
                padding: 16,
                textAlign: "center",
              }}
            >
              <h2>Table {tableNumber}</h2>
              <QRCodeCanvas value={url} size={160} />
              <p style={{ fontSize: 12 }}>{url}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}