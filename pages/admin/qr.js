import { QRCodeCanvas } from "qrcode.react";

export default function QRAdmin() {
  const TABLE_COUNT = 15;

  return (
    <div style={{ padding: 40 }}>
      <h1>테이블 QR 코드</h1>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {Array.from({ length: TABLE_COUNT }).map((_, i) => {
          const tableNumber = i + 1;
          const url = `https://muns-menu.vercel.app/order?table=${tableNumber}`;

          return (
            <div
              key={tableNumber}
              style={{
                border: "1px solid #ccc",
                margin: 12,
                padding: 12,
                textAlign: "center",
              }}
            >
              <h3>Table {tableNumber}</h3>
              <QRCodeCanvas value={url} size={160} />
              <p style={{ fontSize: 12 }}>{url}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}