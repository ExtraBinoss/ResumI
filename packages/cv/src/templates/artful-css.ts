/** Native, print-safe styles for the seven original artful compositions. */
export const artfulCss = `
/* Isolated semantic containers preserve logical PDF text order. */
.cv-sheet .cv-af *{isolation:isolate}
.cv-sheet.cv-vellum,.cv-sheet.cv-chroma,.cv-sheet.cv-terrazzo,.cv-sheet.cv-spectrum,.cv-sheet.cv-bloom,.cv-sheet.cv-kinetic,.cv-sheet.cv-patina{padding:0;font-family:ResumeInter,Arial,sans-serif;letter-spacing:0}
.cv-sheet .cv-af{min-height:1123px;position:relative}
.cv-sheet .cv-af .cv-section{margin-bottom:25px}
.cv-sheet .cv-af .cv-section:last-child{margin-bottom:0}
.cv-sheet .cv-af .cv-section h2{font-size:8.8px;letter-spacing:1.6px;line-height:1.4;color:inherit;margin-bottom:13px}
.cv-sheet .cv-af .cv-entry{margin-bottom:21px}
.cv-sheet .cv-af .cv-entry:last-child{margin-bottom:0}
.cv-sheet .cv-af .cv-entry-head{display:block;margin-bottom:7px}
.cv-sheet .cv-af .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:5px}
.cv-sheet .cv-af .cv-entry h3{font-size:12.7px;line-height:1.45;color:inherit;font-weight:650}
.cv-sheet .cv-af .cv-meta{font-size:9.1px;line-height:1.6;color:#766e63}
.cv-sheet .cv-af .cv-paragraph,.cv-sheet .cv-af .cv-bullets{font-size:11.3px;line-height:1.75;color:inherit}
.cv-sheet .cv-af .cv-bullets{padding-left:13px}
.cv-sheet .cv-af .cv-bullets li{padding-left:1px;margin-bottom:6px}
.cv-sheet .cv-af .cv-bullets li::marker{color:inherit;font-size:6px}
.cv-sheet .cv-af .cv-af-skills{font-size:10.4px;line-height:1.9;white-space:pre-line}
.cv-sheet .cv-af .cv-contacts{color:inherit;font-size:9.6px;gap:6px 20px;margin:0}
.cv-sheet .cv-af .cv-role{color:inherit;font-size:14px;line-height:1.5;margin-top:15px}
.cv-sheet .cv-af-identity{min-width:0}

.cv-sheet.cv-vellum{background:#f5f1e7;color:#343a30}
.cv-sheet .cv-af-vellum{display:grid;grid-template-columns:40px minmax(0,1fr)}
.cv-sheet .cv-af-vellum-spine{position:relative;background:#3c473a;color:#ecebdc;font-size:7px;letter-spacing:2.2px}
.cv-sheet .cv-af-vellum-spine>span{position:absolute;left:14.4px;line-height:11.2px;white-space:nowrap;transform:rotate(-90deg);transform-origin:0 100%}
.cv-sheet .cv-af-vellum-spine>span:first-child{left:25.6px;bottom:35px}
.cv-sheet .cv-af-vellum-spine>span:last-child{top:31px;transform-origin:0 0;transform:rotate(-90deg) translateX(-100%)}
.cv-sheet .cv-af-vellum-page{padding:36px 43px 30px}
.cv-sheet .cv-af-vellum-masthead{display:flex;justify-content:space-between;border-top:1px solid #76806a;padding-top:12px;font-size:7.2px;letter-spacing:1.8px}
.cv-sheet .cv-af-vellum-header{display:flex;justify-content:space-between;align-items:center;margin:40px 0 24px}
.cv-sheet.cv-vellum .cv-name{font:400 87px/.92 Georgia,'Times New Roman',serif;letter-spacing:-4.6px;color:#343a30;max-width:470px}
.cv-sheet.cv-vellum .cv-role{font:italic 400 18px/1.5 Georgia,'Times New Roman',serif;max-width:390px;margin-top:21px}
.cv-sheet .cv-af-vellum-asterisk{font:400 71px/1 Georgia,serif;color:#8c906b;align-self:flex-start;margin-top:8px}
.cv-sheet .cv-af-vellum .cv-contacts{padding:12px 0;border-top:1px solid #c9ccbb;border-bottom:1px solid #c9ccbb;font-size:9.1px}
.cv-sheet .cv-af-vellum-intro{padding:28px 0 29px;max-width:580px}
.cv-sheet .cv-af-vellum-intro .cv-section{display:grid;grid-template-columns:101px minmax(0,1fr);gap:20px}
.cv-sheet .cv-af-vellum-intro .cv-paragraph{font:400 15px/1.65 Georgia,'Times New Roman',serif}
.cv-sheet .cv-af-vellum-main{display:grid;grid-template-columns:1.32fr 1fr;gap:31px;border-top:1px solid #7e866e;padding-top:19px}
.cv-sheet .cv-af-vellum-chapter{position:relative;min-width:0}
.cv-sheet .cv-af-vellum-index{display:block;font:italic 24px/1 Georgia,serif;color:#8a906f;margin-bottom:17px}
.cv-sheet .cv-af-vellum .cv-entry h3{font:400 16px/1.35 Georgia,'Times New Roman',serif}
.cv-sheet .cv-af-vellum .cv-paragraph,.cv-sheet .cv-af-vellum .cv-bullets{font-size:10.9px;line-height:1.75}
.cv-sheet .cv-af-vellum-support{display:grid;grid-template-columns:1.1fr 1.15fr .8fr;gap:25px;border-top:1px solid #c9ccbb;padding-top:20px;margin-top:25px}
.cv-sheet .cv-af-vellum-support .cv-entry h3{font-size:13px}
.cv-sheet .cv-af-vellum-support .cv-paragraph,.cv-sheet .cv-af-vellum-support .cv-af-skills{font-size:9.6px;line-height:1.8}
.cv-sheet .cv-af-vellum-footer{display:flex;justify-content:space-between;padding-top:12px;margin-top:28px;border-top:1px solid #76806a;font-size:7px;letter-spacing:1.7px}

.cv-sheet.cv-chroma{background:#ff745d;color:#27272c}
.cv-sheet .cv-af-chroma{padding:32px 36px 24px}
.cv-sheet .cv-af-chroma-top{display:flex;justify-content:space-between;font-size:7.5px;font-weight:650;letter-spacing:1.1px;border-top:1.5px solid #27272c;padding-top:10px}
.cv-sheet .cv-af-chroma-header{display:grid;grid-template-columns:1fr 156px;gap:19px;align-items:center;margin:25px 0 22px}
.cv-sheet.cv-chroma .cv-name{font-size:88px;line-height:.91;letter-spacing:-6px;font-weight:850;color:#27272c;max-width:450px}
.cv-sheet.cv-chroma .cv-role{font-size:14px;font-weight:550;max-width:410px;margin-top:17px}
.cv-sheet .cv-af-chroma-mark{width:156px;height:156px}
.cv-sheet .cv-af-chroma .cv-contacts{font-size:9.1px;gap:6px 23px;margin-bottom:23px}
.cv-sheet .cv-af-chroma-paper{padding:25px 26px 24px;background:#fff4df;box-shadow:5px 5px 0 #27272c}
.cv-sheet .cv-af-chroma-intro{padding-bottom:21px;border-bottom:1.5px solid #27272c}
.cv-sheet .cv-af-chroma-intro .cv-section{display:grid;grid-template-columns:98px 1fr;gap:17px}
.cv-sheet .cv-af-chroma-intro .cv-paragraph{font-size:12px;line-height:1.65}
.cv-sheet .cv-af-chroma-body{display:grid;grid-template-columns:1.25fr 1fr;gap:28px;padding-top:17px}
.cv-sheet .cv-af-chroma-column{min-width:0}
.cv-sheet .cv-af-chroma-index{display:block;font-size:39px;font-weight:750;line-height:1;letter-spacing:-2px;margin-bottom:17px;color:#df5949}
.cv-sheet .cv-af-chroma-index span{font-weight:400}
.cv-sheet .cv-af-chroma .cv-section h2{font-weight:750;letter-spacing:1px}
.cv-sheet .cv-af-chroma .cv-entry h3{font-size:12px;font-weight:750}
.cv-sheet .cv-af-chroma .cv-paragraph,.cv-sheet .cv-af-chroma .cv-bullets{font-size:10.7px;line-height:1.7}
.cv-sheet .cv-af-chroma-support{display:grid;grid-template-columns:1.1fr 1.05fr .8fr;gap:23px;border-top:1.5px solid #27272c;padding-top:17px;margin-top:20px}
.cv-sheet .cv-af-chroma-support .cv-entry h3{font-size:10.8px}
.cv-sheet .cv-af-chroma-support .cv-paragraph,.cv-sheet .cv-af-chroma-support .cv-af-skills{font-size:9.4px;line-height:1.8}
.cv-sheet .cv-af-chroma-footer{display:flex;align-items:center;justify-content:space-between;padding-top:18px;font-weight:700;font-size:9px;letter-spacing:1.3px}
.cv-sheet .cv-af-chroma-footer>span+span{font-size:28px;line-height:1}

.cv-sheet.cv-terrazzo{background:#f8f5ed;color:#33443d}
.cv-sheet .cv-af-terrazzo{display:grid;grid-template-columns:112px minmax(0,1fr)}
.cv-sheet .cv-af-terrazzo-strip{position:relative;min-height:1123px;overflow:hidden}
.cv-sheet .cv-af-terrazzo-art{width:112px;height:100%;min-height:1123px;display:block}
.cv-sheet .cv-af-terrazzo-strip>span{position:absolute;top:480px;left:67.8px;transform:rotate(90deg);transform-origin:0 0;white-space:nowrap;font-size:8px;line-height:12.8px;letter-spacing:2.8px;color:#fff9ee;background:#33443d;padding:9px 17px}
.cv-sheet .cv-af-terrazzo-page{padding:37px 42px 31px 37px}
.cv-sheet .cv-af-terrazzo-top{display:flex;justify-content:space-between;font-size:7.2px;letter-spacing:1.3px;border-top:1px solid #728174;padding-top:11px}
.cv-sheet .cv-af-terrazzo-header{margin:38px 0 25px}
.cv-sheet.cv-terrazzo .cv-name{font:400 75px/.98 Georgia,'Times New Roman',serif;letter-spacing:-4px;color:#33443d;max-width:510px}
.cv-sheet.cv-terrazzo .cv-role{font-size:12px;letter-spacing:.5px;max-width:390px;margin-top:19px;color:#8f5847}
.cv-sheet .cv-af-terrazzo .cv-contacts{padding-bottom:18px;border-bottom:1px solid #cbcbbd;font-size:9px;gap:6px 16px}
.cv-sheet .cv-af-terrazzo-intro{padding:25px 0 28px}
.cv-sheet .cv-af-terrazzo-intro .cv-paragraph{font:400 15px/1.65 Georgia,'Times New Roman',serif;max-width:490px}
.cv-sheet .cv-af-terrazzo .cv-section h2{color:#8f5847;font-weight:550}
.cv-sheet .cv-af-terrazzo-body{display:grid;grid-template-columns:1.25fr 1fr;gap:27px;border-top:1px solid #8e9988;padding-top:20px}
.cv-sheet .cv-af-terrazzo-body>.cv-section{min-width:0}
.cv-sheet .cv-af-terrazzo .cv-entry h3{font:400 15px/1.4 Georgia,'Times New Roman',serif}
.cv-sheet .cv-af-terrazzo .cv-paragraph,.cv-sheet .cv-af-terrazzo .cv-bullets{font-size:10.7px;line-height:1.75}
.cv-sheet .cv-af-terrazzo-support{display:grid;grid-template-columns:1.08fr 1fr .8fr;gap:20px;margin-top:23px;padding-top:21px;border-top:1px solid #cbcbbd}
.cv-sheet .cv-af-terrazzo-support .cv-entry h3{font-size:12px}
.cv-sheet .cv-af-terrazzo-support .cv-paragraph,.cv-sheet .cv-af-terrazzo-support .cv-af-skills{font-size:9.3px;line-height:1.8}
.cv-sheet .cv-af-terrazzo-footer{display:flex;justify-content:space-between;border-top:1px solid #728174;padding-top:11px;margin-top:28px;font-size:7px;letter-spacing:1.1px}

.cv-sheet.cv-spectrum{background:#fcfaf5;color:#353254}
.cv-sheet .cv-af-spectrum{padding:27px 29px 25px}
.cv-sheet .cv-af-spectrum-header{background:#e1dcf7;border-radius:15px;padding:17px 24px 21px}
.cv-sheet .cv-af-spectrum-top{display:flex;justify-content:space-between;font-size:7.1px;letter-spacing:.9px}
.cv-sheet .cv-af-spectrum-heading{display:grid;grid-template-columns:minmax(0,1fr) 183px;gap:12px;align-items:center;margin:25px 0 22px}
.cv-sheet.cv-spectrum .cv-name{font-size:76px;line-height:.95;letter-spacing:-4.8px;font-weight:650;color:#353254;max-width:435px}
.cv-sheet.cv-spectrum .cv-role{font-size:13px;max-width:360px;margin-top:17px}
.cv-sheet .cv-af-spectrum-art{width:183px;height:157px}
.cv-sheet .cv-af-spectrum .cv-contacts{font-size:9.2px;gap:5px 20px}
.cv-sheet .cv-af-spectrum-intro{display:grid;grid-template-columns:1fr 42px;gap:24px;padding:25px 23px}
.cv-sheet .cv-af-spectrum-intro .cv-section{display:grid;grid-template-columns:93px 1fr;gap:17px}
.cv-sheet .cv-af-spectrum-intro .cv-paragraph{font-size:12px;line-height:1.7}
.cv-sheet .cv-af-spectrum-spark{font-size:45px;line-height:1.1;color:#ed856d;align-self:center}
.cv-sheet .cv-af-spectrum-body{display:grid;grid-template-columns:1.2fr 1fr;gap:16px}
.cv-sheet .cv-af-spectrum-panel{padding:23px 22px;border-radius:14px;background:#eef0dc;min-width:0}
.cv-sheet .cv-af-spectrum-panel+div{background:#f7e1df}
.cv-sheet .cv-af-spectrum .cv-section h2{font-size:8.3px;letter-spacing:1.3px}
.cv-sheet .cv-af-spectrum .cv-entry h3{font-size:12px;line-height:1.4}
.cv-sheet .cv-af-spectrum .cv-paragraph,.cv-sheet .cv-af-spectrum .cv-bullets{font-size:10.7px;line-height:1.7}
.cv-sheet .cv-af-spectrum-support{display:grid;grid-template-columns:1.1fr 1fr .8fr;gap:25px;padding:25px 23px 17px}
.cv-sheet .cv-af-spectrum-support .cv-entry h3{font-size:11.2px}
.cv-sheet .cv-af-spectrum-support .cv-paragraph,.cv-sheet .cv-af-spectrum-support .cv-af-skills{font-size:9.6px;line-height:1.8}
.cv-sheet .cv-af-spectrum-footer{display:flex;justify-content:space-between;margin:4px 23px 0;padding-top:12px;border-top:1px solid #c9c4dc;font-size:7px;letter-spacing:1px}

.cv-sheet.cv-bloom{background:#faeee5;color:#3b4e43}
.cv-sheet .cv-af-bloom{padding:35px 43px 31px}
.cv-sheet .cv-af-bloom-top{display:flex;justify-content:space-between;border-top:1px solid #a3ad95;padding-top:12px;font-size:7.4px;letter-spacing:1.7px}
.cv-sheet .cv-af-bloom-header{display:grid;grid-template-columns:minmax(0,1fr) 216px;gap:10px;align-items:center;margin:20px 0 16px}
.cv-sheet.cv-bloom .cv-name{font:400 83px/.94 Georgia,'Times New Roman',serif;letter-spacing:-4.8px;color:#3b4e43;max-width:445px}
.cv-sheet.cv-bloom .cv-role{font:italic 400 16px/1.5 Georgia,'Times New Roman',serif;max-width:370px;color:#9d4053;margin-top:19px}
.cv-sheet .cv-af-bloom-art{display:block;width:216px;height:216px}
.cv-sheet .cv-af-bloom .cv-contacts{border-top:1px solid #d2c7b6;border-bottom:1px solid #d2c7b6;padding:12px 0;font-size:9.5px}
.cv-sheet .cv-af-bloom-intro{padding:24px 0 28px}
.cv-sheet .cv-af-bloom-intro .cv-section{display:grid;grid-template-columns:115px minmax(0,1fr);gap:24px}
.cv-sheet .cv-af-bloom-intro .cv-paragraph{font:400 16px/1.65 Georgia,'Times New Roman',serif}
.cv-sheet .cv-af-bloom .cv-section h2{color:#9d4053;font-size:8.6px;letter-spacing:1.5px}
.cv-sheet .cv-af-bloom-body{display:grid;grid-template-columns:minmax(0,1fr) 188px;gap:39px}
.cv-sheet .cv-af-bloom-body main>.cv-section{border-top:1px solid #b9bda8;padding-top:16px;margin-bottom:26px}
.cv-sheet .cv-af-bloom-body aside{border-left:1px solid #d2c7b6;padding-left:22px}
.cv-sheet .cv-af-bloom .cv-entry h3{font:400 17px/1.35 Georgia,'Times New Roman',serif}
.cv-sheet .cv-af-bloom .cv-paragraph,.cv-sheet .cv-af-bloom .cv-bullets{font-size:10.8px;line-height:1.75}
.cv-sheet .cv-af-bloom-body aside .cv-entry h3{font-size:14px}
.cv-sheet .cv-af-bloom-body aside .cv-paragraph,.cv-sheet .cv-af-bloom-body aside .cv-af-skills{font-size:9.7px;line-height:1.9}
.cv-sheet .cv-af-bloom-seed{margin-top:28px;padding:20px 0 0;border-top:1px solid #d2c7b6;color:#9d4053;display:flex;flex-direction:column;font:400 24px/1.15 Georgia,serif;letter-spacing:-.8px}
.cv-sheet .cv-af-bloom-seed i{font-style:normal;font-size:45px;color:#9aab82;margin-top:12px}
.cv-sheet .cv-af-bloom-footer{display:flex;justify-content:space-between;font-size:7.1px;letter-spacing:1.4px;margin-top:27px;padding-top:12px;border-top:1px solid #a3ad95}

.cv-sheet.cv-kinetic{background:#f4f3ed;color:#202f73}
.cv-sheet .cv-af-kinetic{padding:31px 42px 30px}
.cv-sheet .cv-af-kinetic-top{display:flex;justify-content:space-between;border-top:3px solid #2446e8;padding-top:10px;font-size:7.6px;letter-spacing:1.5px;font-weight:650}
.cv-sheet .cv-af-kinetic-header{display:grid;grid-template-columns:minmax(0,1fr) 171px;gap:15px;align-items:center;margin:27px 0 24px}
.cv-sheet.cv-kinetic .cv-name{font-size:85px;line-height:.89;font-weight:800;letter-spacing:-5.8px;text-transform:uppercase;color:#2446e8;max-width:475px}
.cv-sheet.cv-kinetic .cv-role{font-size:12px;letter-spacing:.3px;max-width:390px;margin-top:20px}
.cv-sheet .cv-af-kinetic-art{display:block;width:171px;height:171px}
.cv-sheet .cv-af-kinetic .cv-contacts{border-top:1px solid #8a98ca;border-bottom:1px solid #8a98ca;padding:11px 0;font-size:9.4px}
.cv-sheet .cv-af-kinetic-intro{display:grid;grid-template-columns:57px minmax(0,1fr);gap:20px;padding:26px 0}
.cv-sheet .cv-af-kinetic-arrow{font-size:54px;line-height:1;color:#ee713c}
.cv-sheet .cv-af-kinetic-intro .cv-section{display:grid;grid-template-columns:93px minmax(0,1fr);gap:20px}
.cv-sheet .cv-af-kinetic-intro .cv-paragraph{font-size:12.3px;line-height:1.7;max-width:465px}
.cv-sheet .cv-af-kinetic .cv-section h2{font-size:8.5px;letter-spacing:1.4px;color:#2446e8}
.cv-sheet .cv-af-kinetic-row{display:grid;grid-template-columns:57px minmax(0,1fr);gap:20px;border-top:1px solid #8a98ca;padding:18px 0 21px}
.cv-sheet .cv-af-kinetic-number{font-size:28px;letter-spacing:-2px;font-weight:700;color:#ed713b;line-height:1}
.cv-sheet .cv-af-kinetic-row .cv-section{margin:0}
.cv-sheet .cv-af-kinetic-row .cv-section-content{display:grid;grid-template-columns:1fr 1fr;gap:26px}
.cv-sheet .cv-af-kinetic-row .cv-entry{margin:0}
.cv-sheet .cv-af-kinetic .cv-entry h3{font-size:12.7px;line-height:1.4;color:#202f73;font-weight:700}
.cv-sheet .cv-af-kinetic .cv-paragraph,.cv-sheet .cv-af-kinetic .cv-bullets{font-size:10.8px;line-height:1.7}
.cv-sheet .cv-af-kinetic-support{display:grid;grid-template-columns:1.1fr 1fr .8fr;gap:27px;border-top:4px solid #ee713c;padding-top:20px;margin-top:2px}
.cv-sheet .cv-af-kinetic-support .cv-entry h3{font-size:11.5px}
.cv-sheet .cv-af-kinetic-support .cv-paragraph,.cv-sheet .cv-af-kinetic-support .cv-af-skills{font-size:9.6px;line-height:1.8}
.cv-sheet .cv-af-kinetic-footer{display:flex;justify-content:space-between;align-items:center;margin-top:25px;padding-top:14px;border-top:1px solid #8a98ca;font-size:7.5px;letter-spacing:1px}
.cv-sheet .cv-af-kinetic-footer>div{display:flex;gap:4px;height:15px}
.cv-sheet .cv-af-kinetic-footer>div>span{display:block;height:15px;background:#2446e8}

.cv-sheet.cv-patina{background:#f3eee3;color:#36433c}
.cv-sheet .cv-af-patina{display:grid;grid-template-columns:224px minmax(0,1fr)}
.cv-sheet .cv-af-patina-rail{background:#293a35;color:#e8e3d0;padding:33px 25px 30px;min-height:1123px}
.cv-sheet .cv-af-patina-label{font-size:6.6px;letter-spacing:1.6px;color:#b6bc9f;border-top:1px solid #768375;padding-top:12px;white-space:nowrap}
.cv-sheet .cv-af-patina-art{display:block;width:174px;height:229px;margin:14px 0 0}
.cv-sheet .cv-af-patina-caption{display:flex;justify-content:space-between;font:6.5px/1.5 monospace;letter-spacing:.8px;color:#b5bb9e;margin-bottom:26px}
.cv-sheet .cv-af-patina .cv-contacts{display:grid;font-size:9px;gap:12px;color:#e2d8c0;padding-top:19px;border-top:1px solid #64766a;margin-bottom:29px}
.cv-sheet .cv-af-patina-rail .cv-section{margin-bottom:29px}
.cv-sheet .cv-af-patina-rail .cv-section h2{color:#cda47b;font-size:7.8px;letter-spacing:1.6px}
.cv-sheet .cv-af-patina-rail .cv-entry h3{font-size:11.4px;font-weight:500}
.cv-sheet .cv-af-patina-rail .cv-paragraph,.cv-sheet .cv-af-patina-rail .cv-af-skills{font-size:9.6px;line-height:1.85}
.cv-sheet .cv-af-patina-rail .cv-meta{font-size:8.3px;color:#c6ccb6}
.cv-sheet .cv-af-patina-stamp{margin-top:32px;display:flex;flex-direction:column;border:1px solid #947e63;color:#cda47b;padding:13px 16px;transform:rotate(-3deg);width:140px;font-size:8px;letter-spacing:2px}
.cv-sheet .cv-af-patina-stamp strong{font-size:28px;line-height:1.25;letter-spacing:0;font-weight:500}
.cv-sheet .cv-af-patina-main{padding:35px 39px 30px}
.cv-sheet .cv-af-patina-top{display:flex;justify-content:space-between;border-top:1px solid #ac9c82;padding-top:12px;font-size:7px;letter-spacing:1.2px;color:#8e6b4d}
.cv-sheet .cv-af-patina-header{margin:40px 0 31px}
.cv-sheet.cv-patina .cv-name{font:400 74px/.96 Georgia,'Times New Roman',serif;letter-spacing:-4.2px;color:#31433b;max-width:390px}
.cv-sheet.cv-patina .cv-role{font-size:12px;letter-spacing:.4px;color:#936749;max-width:365px;margin-top:21px}
.cv-sheet .cv-af-patina-intro{padding-bottom:26px;border-bottom:1px solid #c8bea9}
.cv-sheet .cv-af-patina-intro .cv-paragraph{font:400 15px/1.65 Georgia,'Times New Roman',serif}
.cv-sheet .cv-af-patina-main .cv-section h2{color:#936749;font-size:8.2px;letter-spacing:1.6px}
.cv-sheet .cv-af-patina-career{padding-top:24px}
.cv-sheet .cv-af-patina-career>.cv-section{margin-bottom:28px}
.cv-sheet .cv-af-patina-main .cv-entry h3{font-size:12.4px;line-height:1.45;font-weight:650}
.cv-sheet .cv-af-patina-main .cv-paragraph,.cv-sheet .cv-af-patina-main .cv-bullets{font-size:10.8px;line-height:1.75}
.cv-sheet .cv-af-patina-footer{display:flex;justify-content:space-between;border-top:1px solid #ac9c82;padding-top:12px;margin-top:29px;font-size:6.6px;letter-spacing:.8px;color:#8e6b4d}
`;
