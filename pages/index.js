export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Muns Kitchen</h1>
      <p>QR 주문 테스트</p>

      <a href="/order">
        <button style={{ fontSize: 18 }}>주문 시작</button>
      </a>
    </div>
  );
}