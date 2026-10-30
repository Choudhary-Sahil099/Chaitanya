export default function BrandLogo() {
  return (
    <a className="brand" href="#home" aria-label="SkinSight home">
      <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M17 7C8 18 8 35 18 46c8-8 12-19 10-31C26 10 22 8 17 7Z" fill="#6C8CF4" />
        <path d="M31 18C39 8 51 7 60 8c0 17-9 30-26 34-4-8-5-16-3-24Z" fill="#55B8F4" />
        <path d="M17 47c9-1 18-7 22-17-1 14-9 25-23 28-3-3-2-8 1-11Z" fill="#4779E8" opacity=".88"/>
      </svg>
      <span className="brand-name">Skin<span>Sight</span></span>
    </a>
  );
}
