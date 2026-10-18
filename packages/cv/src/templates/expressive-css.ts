/** Portable document styles. Each composition owns its typography, geometry and palette. */
export const expressiveCss = `
.cv-sheet.cv-risograph,.cv-sheet.cv-swiss,.cv-sheet.cv-botanica,.cv-sheet.cv-cassette,.cv-sheet.cv-signal{font-family:ResumeInter,Arial,sans-serif;letter-spacing:0}
.cv-sheet.cv-risograph .cv-section,.cv-sheet.cv-swiss .cv-section,.cv-sheet.cv-botanica .cv-section,.cv-sheet.cv-cassette .cv-section,.cv-sheet.cv-signal .cv-section{margin-bottom:23px}
.cv-sheet.cv-risograph .cv-entry-head,.cv-sheet.cv-swiss .cv-entry-head,.cv-sheet.cv-botanica .cv-entry-head,.cv-sheet.cv-cassette .cv-entry-head,.cv-sheet.cv-signal .cv-entry-head{display:block;margin-bottom:7px}
.cv-sheet.cv-risograph .cv-entry-head .cv-meta,.cv-sheet.cv-swiss .cv-entry-head .cv-meta,.cv-sheet.cv-botanica .cv-entry-head .cv-meta,.cv-sheet.cv-cassette .cv-entry-head .cv-meta,.cv-sheet.cv-signal .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:4px}
.cv-sheet.cv-risograph .cv-entry,.cv-sheet.cv-swiss .cv-entry,.cv-sheet.cv-botanica .cv-entry,.cv-sheet.cv-cassette .cv-entry,.cv-sheet.cv-signal .cv-entry{margin-bottom:20px}
.cv-sheet.cv-risograph .cv-ex-skill,.cv-sheet.cv-swiss .cv-ex-skill,.cv-sheet.cv-botanica .cv-ex-skill,.cv-sheet.cv-cassette .cv-ex-skill,.cv-sheet.cv-signal .cv-ex-skill{white-space:pre-line;font-size:10.8px;line-height:1.8}
.cv-sheet.cv-risograph .cv-bullets li,.cv-sheet.cv-swiss .cv-bullets li,.cv-sheet.cv-botanica .cv-bullets li,.cv-sheet.cv-cassette .cv-bullets li,.cv-sheet.cv-signal .cv-bullets li{margin-bottom:6px;padding-left:1px}

.cv-sheet.cv-risograph{padding:35px 45px 34px;background:#fff5e5;color:#552b38}
.cv-sheet.cv-risograph .cv-ex-riso-top{display:flex;justify-content:space-between;border-top:2px solid #552b38;padding-top:9px;font:9px/1.4 monospace;letter-spacing:1.2px}
.cv-sheet.cv-risograph .cv-ex-riso-header{display:grid;grid-template-columns:minmax(0,1fr) 192px;gap:20px;align-items:center;margin:24px 0 17px}
.cv-sheet.cv-risograph .cv-name{font-size:70px;line-height:.97;letter-spacing:-4px;font-weight:800;color:#bc3663;max-width:430px}
.cv-sheet.cv-risograph .cv-role{font-size:15px;line-height:1.4;color:#703349;margin-top:16px;max-width:350px}
.cv-sheet.cv-risograph .cv-ex-riso-art{display:block;width:192px;height:173px}
.cv-sheet.cv-risograph .cv-contacts{margin:0;border-top:1px solid #d9a59e;border-bottom:1px solid #d9a59e;padding:11px 0;gap:6px 19px;font-size:10px;color:#703349}
.cv-sheet.cv-risograph .cv-ex-riso-intro{margin:23px 0 26px;display:grid;grid-template-columns:1fr}
.cv-sheet.cv-risograph .cv-ex-riso-intro .cv-section{display:grid;grid-template-columns:112px minmax(0,1fr);gap:20px;margin:0}
.cv-sheet.cv-risograph .cv-ex-riso-intro .cv-paragraph{font-size:12.5px;line-height:1.7}
.cv-sheet.cv-risograph .cv-section h2{font-size:9.4px;letter-spacing:1.4px;color:#b03a5f;margin-bottom:14px}
.cv-sheet.cv-risograph .cv-ex-riso-body{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:30px}
.cv-sheet.cv-risograph .cv-ex-riso-column{border-top:7px solid #ee8255;padding-top:14px;min-width:0}
.cv-sheet.cv-risograph .cv-ex-riso-column:nth-child(even){border-top-color:#d75585;padding-top:36px}
.cv-sheet.cv-risograph .cv-entry h3{font-size:13px;line-height:1.45;color:#552b38;font-weight:700}
.cv-sheet.cv-risograph .cv-meta{font:9.6px/1.6 monospace;color:#85505a}
.cv-sheet.cv-risograph .cv-paragraph,.cv-sheet.cv-risograph .cv-bullets{font-size:11.4px;line-height:1.7;color:#65434a}
.cv-sheet.cv-risograph .cv-bullets li::marker{color:#bd3c6b}
.cv-sheet.cv-risograph .cv-ex-riso-support{display:grid;grid-template-columns:1.12fr 1.15fr .8fr;gap:25px;margin-top:19px;padding-top:19px;border-top:1px solid #d9a59e}
.cv-sheet.cv-risograph .cv-ex-riso-support .cv-entry h3{font-size:11px}
.cv-sheet.cv-risograph .cv-ex-riso-support .cv-paragraph,.cv-sheet.cv-risograph .cv-ex-riso-support .cv-ex-skill{font-size:10.3px;color:#65434a}
.cv-sheet.cv-risograph .cv-ex-riso-footer{display:flex;align-items:center;gap:6px;margin-top:24px;border-top:1px solid #d9a59e;padding-top:10px}
.cv-sheet.cv-risograph .cv-ex-riso-footer>span{height:9px;width:24px;background:#ed8257}
.cv-sheet.cv-risograph .cv-ex-riso-footer>span:nth-child(2){background:#d75484}.cv-sheet.cv-risograph .cv-ex-riso-footer>span:nth-child(3){background:#552b38}
.cv-sheet.cv-risograph .cv-ex-riso-footer i{margin-left:auto;font:10px monospace;font-style:normal}

.cv-sheet.cv-swiss{padding:33px 43px;background:#f6e948;color:#161813}
.cv-sheet.cv-swiss .cv-ex-swiss-top{display:flex;justify-content:space-between;border-top:5px solid #161813;padding-top:9px;font-size:8px;letter-spacing:1.2px;font-weight:700}
.cv-sheet.cv-swiss .cv-ex-swiss-header{display:grid;grid-template-columns:minmax(0,1fr) 129px;gap:23px;align-items:end;padding:22px 0 23px}
.cv-sheet.cv-swiss .cv-name{font-size:91px;line-height:.92;letter-spacing:-6px;font-weight:850;color:#161813;max-width:490px}
.cv-sheet.cv-swiss .cv-role{margin-top:18px;font-size:16px;line-height:1.3;font-weight:650;color:#161813;max-width:440px}
.cv-sheet.cv-swiss .cv-ex-swiss-symbol{position:relative;height:129px;background:#161813}
.cv-sheet.cv-swiss .cv-ex-swiss-symbol span{position:absolute;left:24px;right:24px;top:55px;height:19px;background:#f6e948}
.cv-sheet.cv-swiss .cv-ex-swiss-symbol span+span{transform:rotate(90deg)}
.cv-sheet.cv-swiss .cv-contacts{font-size:9.8px;color:#161813;margin:0;padding:11px 0;border-top:2px solid #161813;border-bottom:2px solid #161813;gap:6px 22px}
.cv-sheet.cv-swiss .cv-ex-swiss-row{display:grid;grid-template-columns:58px minmax(0,1fr);gap:16px;border-bottom:1px solid #161813;padding:20px 0 19px}
.cv-sheet.cv-swiss .cv-ex-swiss-index{font-size:25px;line-height:1;font-weight:800;letter-spacing:-1px}
.cv-sheet.cv-swiss .cv-ex-swiss-row .cv-section{margin:0}
.cv-sheet.cv-swiss .cv-section h2{font-size:9px;font-weight:800;letter-spacing:1.4px;color:#161813;margin-bottom:13px}
.cv-sheet.cv-swiss .cv-ex-swiss-row:not(:first-child) .cv-section-content{display:grid;grid-template-columns:1fr 1fr;gap:23px}
.cv-sheet.cv-swiss .cv-ex-swiss-row .cv-entry{margin:0}
.cv-sheet.cv-swiss .cv-entry h3{font-size:13px;line-height:1.4;font-weight:800;color:#161813}
.cv-sheet.cv-swiss .cv-meta{font-size:9px;line-height:1.5;color:#484629}
.cv-sheet.cv-swiss .cv-paragraph,.cv-sheet.cv-swiss .cv-bullets{font-size:11.2px;line-height:1.65;color:#292b1a}
.cv-sheet.cv-swiss .cv-bullets{padding-left:12px}
.cv-sheet.cv-swiss .cv-bullets li::marker{color:#161813}
.cv-sheet.cv-swiss .cv-ex-swiss-row:first-child .cv-paragraph{font-size:13.2px;line-height:1.65;max-width:570px}
.cv-sheet.cv-swiss .cv-ex-swiss-support{display:grid;grid-template-columns:1.1fr 1fr .7fr;gap:24px;padding-top:23px}
.cv-sheet.cv-swiss .cv-ex-swiss-support .cv-entry h3{font-size:10.8px}
.cv-sheet.cv-swiss .cv-ex-swiss-support .cv-ex-skill,.cv-sheet.cv-swiss .cv-ex-swiss-support .cv-paragraph{font-size:10px;line-height:1.7}
.cv-sheet.cv-swiss .cv-ex-swiss-footer{display:flex;justify-content:space-between;align-items:center;padding-top:11px;border-top:5px solid #161813;margin-top:21px;font-size:8px;letter-spacing:1.5px;font-weight:700}

.cv-sheet.cv-botanica{padding:46px 43px 34px 31px;display:grid;grid-template-columns:190px minmax(0,1fr);column-gap:40px;align-content:start;background:#f7f4e9;color:#324a3d}
.cv-sheet.cv-botanica .cv-ex-botanic-rail{padding-right:22px;border-right:1px solid #bfc9b5}
.cv-sheet.cv-botanica .cv-ex-botanic-label{font-size:7.5px;letter-spacing:2px;color:#6b7d65;text-align:center;margin:1px 0 4px}
.cv-sheet.cv-botanica .cv-ex-botanic-art{display:block;width:166px;height:264px;margin-bottom:18px}
.cv-sheet.cv-botanica .cv-contacts{display:grid;gap:10px;font-size:9.7px;line-height:1.5;color:#4c6253;margin:0 0 28px;overflow-wrap:anywhere}
.cv-sheet.cv-botanica .cv-ex-botanic-kicker{font-size:8px;letter-spacing:2.5px;color:#657e62;margin:0 0 27px;padding-bottom:11px;border-bottom:1px solid #bfc9b5}
.cv-sheet.cv-botanica .cv-ex-botanic-header{margin-bottom:29px}
.cv-sheet.cv-botanica .cv-name{font:400 66px/.99 Georgia,'Times New Roman',serif;letter-spacing:-3px;color:#344e3c;max-width:360px}
.cv-sheet.cv-botanica .cv-role{font-size:14px;line-height:1.5;letter-spacing:.1px;margin-top:16px;color:#6a795a;max-width:330px}
.cv-sheet.cv-botanica .cv-section h2{font-size:8.5px;letter-spacing:1.8px;color:#73825c;margin-bottom:13px}
.cv-sheet.cv-botanica .cv-ex-botanic-main>.cv-section{border-top:1px solid #cbd1bc;padding-top:16px;margin-bottom:23px}
.cv-sheet.cv-botanica .cv-entry h3{font:400 16px/1.4 Georgia,'Times New Roman',serif;color:#344e3c}
.cv-sheet.cv-botanica .cv-meta{font-size:9.2px;line-height:1.6;color:#7c8069}
.cv-sheet.cv-botanica .cv-paragraph,.cv-sheet.cv-botanica .cv-bullets{font-size:11.2px;line-height:1.75;color:#526052}
.cv-sheet.cv-botanica .cv-bullets li::marker{color:#8b9d77}
.cv-sheet.cv-botanica .cv-ex-botanic-rail .cv-section{margin-bottom:25px}
.cv-sheet.cv-botanica .cv-ex-botanic-rail .cv-entry h3{font-size:13.3px}
.cv-sheet.cv-botanica .cv-ex-botanic-rail .cv-paragraph,.cv-sheet.cv-botanica .cv-ex-botanic-rail .cv-ex-skill{font-size:10px;line-height:1.8;color:#526052}
.cv-sheet.cv-botanica .cv-ex-botanic-footer{grid-column:1/-1;display:flex;justify-content:space-between;margin-top:24px;padding-top:12px;border-top:1px solid #bfc9b5;font-size:7.5px;letter-spacing:2px;color:#657e62}

.cv-sheet.cv-cassette{padding:35px 43px 33px;background:#fbf2df;color:#34302c}
.cv-sheet.cv-cassette .cv-ex-cassette-top{display:flex;justify-content:space-between;font:8.5px/1.4 monospace;letter-spacing:1.2px;padding:9px 0;border-top:2px solid #34302c;border-bottom:1px solid #bdb09a}
.cv-sheet.cv-cassette .cv-ex-cassette-header{display:grid;grid-template-columns:minmax(0,1fr) 237px;gap:18px;align-items:center;margin:15px 0 16px}
.cv-sheet.cv-cassette .cv-name{font-size:68px;line-height:.96;letter-spacing:-3.9px;font-weight:750;color:#34302c;max-width:390px}
.cv-sheet.cv-cassette .cv-role{font:11.5px/1.6 monospace;color:#b14b37;margin-top:15px;max-width:330px}
.cv-sheet.cv-cassette .cv-ex-cassette-art{width:237px;height:167px;transform:rotate(-5deg)}
.cv-sheet.cv-cassette .cv-contacts{margin:0;padding:10px 0 14px;border-bottom:1px solid #bdb09a;font:9.2px/1.5 monospace;color:#64594e;gap:5px 19px}
.cv-sheet.cv-cassette .cv-ex-cassette-intro{margin:22px 0 27px;padding:13px 19px;border-left:5px solid #ef765f;background:#f3e6cc}
.cv-sheet.cv-cassette .cv-ex-cassette-intro .cv-section{margin:0;display:grid;grid-template-columns:86px minmax(0,1fr);gap:18px}
.cv-sheet.cv-cassette .cv-ex-cassette-intro .cv-paragraph{font-size:12px;line-height:1.7}
.cv-sheet.cv-cassette .cv-section h2{font:700 9px/1.4 monospace;letter-spacing:1px;color:#a94332;margin-bottom:14px}
.cv-sheet.cv-cassette .cv-ex-cassette-body{display:grid;grid-template-columns:minmax(0,1.48fr) minmax(0,1fr);gap:30px}
.cv-sheet.cv-cassette .cv-ex-cassette-track{min-width:0}
.cv-sheet.cv-cassette .cv-ex-cassette-side{display:flex;align-items:center;gap:9px;font-size:31px;line-height:1;font-weight:800;margin-bottom:14px;border-bottom:2px solid #34302c;padding-bottom:9px}
.cv-sheet.cv-cassette .cv-ex-cassette-side span{font:8px monospace;letter-spacing:2px}
.cv-sheet.cv-cassette .cv-entry h3{font-size:12.6px;line-height:1.45;font-weight:750;color:#34302c}
.cv-sheet.cv-cassette .cv-meta{font:9px/1.6 monospace;color:#8a6b58}
.cv-sheet.cv-cassette .cv-paragraph,.cv-sheet.cv-cassette .cv-bullets{font-size:11.3px;line-height:1.7;color:#61574d}
.cv-sheet.cv-cassette .cv-bullets li::marker{color:#d15b45}
.cv-sheet.cv-cassette .cv-ex-cassette-support{display:grid;grid-template-columns:1.1fr 1fr .8fr;gap:25px;border-top:1px solid #bdb09a;padding-top:20px;margin-top:16px}
.cv-sheet.cv-cassette .cv-ex-cassette-support .cv-entry h3{font-size:10.7px}
.cv-sheet.cv-cassette .cv-ex-cassette-support .cv-paragraph,.cv-sheet.cv-cassette .cv-ex-cassette-support .cv-ex-skill{font-size:10px;line-height:1.75}
.cv-sheet.cv-cassette .cv-ex-cassette-footer{margin-top:17px;border-top:2px solid #34302c;padding-top:12px}
.cv-sheet.cv-cassette .cv-ex-wave{display:block;width:100%;height:35px}

.cv-sheet.cv-signal{padding:34px 44px 33px;background:#f1edf8;color:#392b53}
.cv-sheet.cv-signal .cv-ex-signal-top{display:flex;justify-content:space-between;font:8px/1.5 monospace;letter-spacing:1px;padding-top:10px;border-top:1px solid #755797;color:#6b5487}
.cv-sheet.cv-signal .cv-ex-signal-header{display:grid;grid-template-columns:208px minmax(0,1fr);gap:18px;align-items:center;margin:14px 0 17px}
.cv-sheet.cv-signal .cv-ex-signal-art{display:block;width:208px;height:208px}
.cv-sheet.cv-signal .cv-name{font:italic 400 73px/.93 Georgia,'Times New Roman',serif;letter-spacing:-4px;color:#56338a;max-width:410px}
.cv-sheet.cv-signal .cv-role{font-size:13px;line-height:1.5;letter-spacing:.2px;color:#6b5487;margin-top:17px;max-width:340px}
.cv-sheet.cv-signal .cv-contacts{margin:0;padding:10px 0 12px;border-top:1px solid #ad9cbe;border-bottom:1px solid #ad9cbe;font-size:9.8px;color:#6b5487;gap:6px 20px}
.cv-sheet.cv-signal .cv-ex-signal-intro{margin:22px 0 25px}
.cv-sheet.cv-signal .cv-ex-signal-intro .cv-section{display:grid;grid-template-columns:112px minmax(0,1fr);gap:18px;margin:0}
.cv-sheet.cv-signal .cv-ex-signal-intro .cv-paragraph{font-size:12.6px;line-height:1.7;color:#4c3f60}
.cv-sheet.cv-signal .cv-section h2{font-size:8.7px;letter-spacing:1.6px;color:#755797;margin-bottom:14px}
.cv-sheet.cv-signal .cv-ex-signal-body{display:grid;grid-template-columns:minmax(0,1.42fr) minmax(0,1fr);gap:32px}
.cv-sheet.cv-signal .cv-ex-signal-column{border-top:1px solid #ad9cbe;padding-top:9px;min-width:0}
.cv-sheet.cv-signal .cv-ex-signal-column+div{border-top:8px solid #bed69a;padding-top:2px}
.cv-sheet.cv-signal .cv-ex-signal-index{display:block;font:italic 400 32px/1.2 Georgia,'Times New Roman',serif;color:#755797;margin-bottom:14px}
.cv-sheet.cv-signal .cv-entry h3{font:400 16px/1.35 Georgia,'Times New Roman',serif;color:#442e64;letter-spacing:-.2px}
.cv-sheet.cv-signal .cv-meta{font:9px/1.6 monospace;color:#8b759e}
.cv-sheet.cv-signal .cv-paragraph,.cv-sheet.cv-signal .cv-bullets{font-size:11.2px;line-height:1.7;color:#62546e}
.cv-sheet.cv-signal .cv-bullets li::marker{color:#765397}
.cv-sheet.cv-signal .cv-ex-signal-support{display:grid;grid-template-columns:1.1fr 1fr .75fr;gap:25px;border-top:1px solid #ad9cbe;padding-top:20px;margin-top:18px}
.cv-sheet.cv-signal .cv-ex-signal-support .cv-entry h3{font-size:13px}
.cv-sheet.cv-signal .cv-ex-signal-support .cv-paragraph,.cv-sheet.cv-signal .cv-ex-signal-support .cv-ex-skill{font-size:10px;line-height:1.75}
.cv-sheet.cv-signal .cv-ex-signal-footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #ad9cbe;padding-top:10px;margin-top:19px;font:8px monospace;letter-spacing:1px;color:#755797}
.cv-sheet.cv-signal .cv-ex-signal-dots{font-size:12px;letter-spacing:7px;color:#6b5487}
`;
