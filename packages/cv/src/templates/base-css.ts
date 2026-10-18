/** Shared offline document typography and A4 rules. */
export const baseCss = `
.resume.cv-sheet,.cv-sheet *{box-sizing:border-box}
.resume.cv-sheet{position:relative;width:794px;min-height:1123px;margin:0;padding:56px 58px;background:#fff;color:#23272a;font:13px/1.6 ResumeInter,Arial,sans-serif;letter-spacing:-.08px;text-align:left;isolation:isolate}
.cv-sheet h1,.cv-sheet h2,.cv-sheet h3,.cv-sheet p,.cv-sheet ul{margin:0}
.cv-sheet a{color:inherit;text-decoration:none}
.cv-sheet .cv-header{margin-bottom:34px;padding-bottom:29px;border-bottom:1px solid #dfe3e5}
.cv-sheet .cv-name{font:600 42px/1.1 ResumeInter,Arial,sans-serif;letter-spacing:-1.9px;color:#17232a}
.cv-sheet .cv-role{margin-top:10px;font-size:17px;font-weight:450;line-height:1.3;color:var(--cv-accent)}
.cv-sheet .cv-contacts{display:flex;flex-wrap:wrap;gap:9px 20px;margin-top:21px;font-size:10.6px;font-style:normal;color:#5b646a;line-height:1.45}
.cv-sheet .cv-contacts>span{display:flex;align-items:center;gap:7px;min-width:0}
.cv-sheet .cv-contacts svg{flex:0 0 14px;color:var(--cv-accent)}
.cv-sheet .cv-contacts a{overflow-wrap:anywhere}
.cv-sheet .cv-section{margin:0 0 28px;break-inside:avoid}
.cv-sheet .cv-section:last-child{margin-bottom:0}
.cv-sheet .cv-section h2{margin:0 0 13px;font-size:10.5px;line-height:1.3;font-weight:650;letter-spacing:1.55px;text-transform:uppercase;color:var(--cv-accent)}
.cv-sheet .cv-entry{margin-bottom:23px}
.cv-sheet .cv-entry:last-child{margin-bottom:0}
.cv-sheet .cv-entry-head{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:8px}
.cv-sheet .cv-entry h3{font-size:13.3px;font-weight:620;line-height:1.45;color:#252c31}
.cv-sheet .cv-meta{color:#70787d;font-size:10.6px;line-height:1.55;white-space:pre-wrap}
.cv-sheet .cv-entry-head .cv-meta{flex:0 0 auto;max-width:42%;text-align:right}
.cv-sheet .cv-paragraph{font-size:12.5px;line-height:1.72;white-space:pre-wrap;color:#4b5359}
.cv-sheet .cv-bullets{padding-left:15px;font-size:12px;line-height:1.7;color:#4b5359}
.cv-sheet .cv-bullets li{padding-left:3px;margin-bottom:7px}
.cv-sheet .cv-bullets li:last-child{margin-bottom:0}
.cv-sheet .cv-bullets li::marker{font-size:8px;color:var(--cv-accent)}
.cv-sheet .cv-skill-list{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;padding:0;list-style:none;font-size:12px;color:#4b5359}
.cv-sheet .cv-columns{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:37px}
.cv-sheet .cv-aside{border-left:1px solid #e3e7e8;padding-left:25px}
.cv-sheet .cv-aside .cv-skill-list{grid-template-columns:1fr;gap:7px}
.cv-sheet .cv-aside .cv-entry-head{display:block;margin-bottom:7px}
.cv-sheet .cv-aside .cv-entry h3{font-size:12px}
.cv-sheet .cv-aside .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:7px}
.cv-sheet .cv-aside .cv-section{margin-bottom:29px}
.cv-sheet .cv-portrait{display:block;width:126px;height:148px;object-fit:cover;object-position:50% 43%;background:#e7e9e6;border-radius:2px}
.cv-sheet.cv-classic{padding:57px 62px;font-family:Georgia,'Times New Roman',serif;font-size:13.5px}
.cv-sheet.cv-classic .cv-header{text-align:center;border-bottom:1.5px solid #26323a;margin-bottom:29px;padding-bottom:23px}
.cv-sheet.cv-classic .cv-name{font:400 39px/1.15 Georgia,'Times New Roman',serif;letter-spacing:-.6px;color:#20272c}
.cv-sheet.cv-classic .cv-role{font:450 14px/1.4 ResumeInter,Arial,sans-serif;color:#525b62;margin-top:9px}
.cv-sheet.cv-classic .cv-contacts{justify-content:center;gap:5px 17px;margin-top:17px;font-family:ResumeInter,Arial,sans-serif;font-size:10.2px}
.cv-sheet.cv-classic .cv-contacts svg{display:none}
.cv-sheet.cv-classic .cv-section{margin-bottom:24px}
.cv-sheet.cv-classic .cv-section h2{color:#26323a;font:600 10.8px/1.4 ResumeInter,Arial,sans-serif;letter-spacing:1.2px;padding-bottom:7px;border-bottom:1px solid #d8dde0;margin-bottom:13px}
.cv-sheet.cv-classic .cv-entry h3{font:600 13px/1.45 ResumeInter,Arial,sans-serif}
.cv-sheet.cv-classic .cv-entry{margin-bottom:19px}
.cv-sheet.cv-classic .cv-paragraph,.cv-sheet.cv-classic .cv-bullets{font-size:13.1px;line-height:1.62;color:#363c41}
.cv-sheet.cv-classic .cv-skill-list{font:12px/1.6 ResumeInter,Arial,sans-serif;grid-template-columns:1fr 1fr 1fr;gap:7px 18px}
.cv-sheet.cv-classic .cv-meta{font-family:ResumeInter,Arial,sans-serif}
.cv-sheet.cv-editorial{padding:58px 57px;color:#292b2b}
.cv-sheet.cv-editorial .cv-header{display:grid;grid-template-columns:minmax(0,1fr) 191px;gap:28px;align-items:end;border-bottom:1px solid #c9c6c0;padding-bottom:32px;margin-bottom:30px}
.cv-sheet.cv-editorial .cv-name{font:400 52px/1.03 Georgia,'Times New Roman',serif;letter-spacing:-2.2px;color:#2e3536;max-width:360px}
.cv-sheet.cv-editorial .cv-role{font-size:14px;letter-spacing:.3px;margin-top:14px}
.cv-sheet.cv-editorial .cv-contacts{display:grid;gap:10px;margin:0;padding-left:20px;border-left:1px solid #d7d4ce;font-size:10.5px}
.cv-sheet.cv-editorial .cv-section{display:grid;grid-template-columns:112px minmax(0,1fr);gap:20px;margin-bottom:22px}
.cv-sheet.cv-editorial .cv-section:last-child{margin-bottom:0}
.cv-sheet.cv-editorial .cv-section h2{font-size:10px;line-height:1.5;letter-spacing:1.2px;padding-top:3px}
.cv-sheet.cv-editorial .cv-entry-head{display:block;margin-bottom:9px}
.cv-sheet.cv-editorial .cv-entry h3{font:400 18px/1.35 Georgia,'Times New Roman',serif;letter-spacing:-.2px}
.cv-sheet.cv-editorial .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:6px;font-size:10px;letter-spacing:.1px}
.cv-sheet.cv-editorial .cv-paragraph{font-size:12.8px;line-height:1.8}
.cv-sheet.cv-editorial .cv-skill-list{gap:7px 18px}
.cv-sheet.cv-profile{padding:0;display:grid;grid-template-columns:230px minmax(0,1fr);min-height:1123px}
.cv-sheet .cv-profile-rail{padding:54px 29px;background:#edf1ef;min-height:1123px}
.cv-sheet .cv-profile-rail .cv-portrait{margin-bottom:29px}
.cv-sheet .cv-profile-rail .cv-contacts{display:grid;gap:14px;margin:0 0 33px;font-size:10.5px}
.cv-sheet .cv-profile-rail .cv-contacts>span{align-items:flex-start}
.cv-sheet .cv-profile-rail .cv-contacts svg{margin-top:1px}
.cv-sheet .cv-profile-rail .cv-section{margin-bottom:31px}
.cv-sheet .cv-profile-rail .cv-entry-head{display:block}
.cv-sheet .cv-profile-rail .cv-entry h3{font-size:12.1px}
.cv-sheet .cv-profile-rail .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:7px}
.cv-sheet .cv-profile-rail .cv-skill-list{grid-template-columns:1fr;gap:8px}
.cv-sheet .cv-profile-main{padding:63px 43px 50px}
.cv-sheet.cv-profile .cv-header{padding-bottom:27px;margin-bottom:29px;border-bottom:1px solid #d8dfdc}
.cv-sheet.cv-profile .cv-name{font-size:39px;letter-spacing:-1.45px;color:#263d37}
.cv-sheet.cv-profile .cv-role{font-size:15px;margin-top:12px}
.cv-sheet.cv-profile .cv-entry-head{display:block}
.cv-sheet.cv-profile .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:6px}
.cv-sheet.cv-profile .cv-entry h3{font-size:13.6px}
.cv-sheet.cv-profile .cv-paragraph{font-size:12.4px;line-height:1.78}
@page{size:A4;margin:0}
@media print{.resume.cv-sheet{margin:0;width:210mm;min-height:297mm;box-shadow:none;print-color-adjust:exact;-webkit-print-color-adjust:exact}.cv-sheet .cv-profile-rail{min-height:297mm}}
`;
