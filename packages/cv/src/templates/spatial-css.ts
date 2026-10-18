/** Portable A4 compositions. Text, photographic prints and drawings stay independent. */
export const spatialCss = `
/* Keep positioned annotations in the same PDF text order as their content. */
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) *{isolation:isolate}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid){--cv-accent:#51624d}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-spatial-kicker{display:block;font:600 8px/1.5 ResumeInter,Arial,sans-serif;letter-spacing:2px}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-entry-head{display:block;margin-bottom:7px}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:4px}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-section{margin-bottom:26px}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-section h2{font-size:8.5px;line-height:1.5;letter-spacing:1.5px;margin-bottom:13px}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-entry{margin-bottom:19px}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-entry h3{font-size:12px;line-height:1.45;font-weight:600}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-meta{font-size:9px;line-height:1.6}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-paragraph,.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-bullets{font-size:11px;line-height:1.75}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-bullets{padding-left:12px}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-bullets li{margin-bottom:6px;padding-left:2px}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-skill-list{grid-template-columns:1fr;gap:6px;font-size:10.5px;line-height:1.6}
.cv-sheet:is(.cv-contour,.cv-nocturne,.cv-solstice,.cv-aerogram,.cv-gridline,.cv-polaroid) .cv-spatial-footer{position:absolute;bottom:27px;left:46px;right:46px;display:flex;justify-content:space-between;border-top:1px solid currentColor;padding-top:11px;font:7.5px/1.4 ResumeInter,Arial,sans-serif;letter-spacing:.6px}

.cv-sheet.cv-contour{padding:39px 46px 69px;background:#f4f2e9;color:#334936;--cv-accent:#4c654c}
.cv-sheet.cv-contour .cv-contour-header{display:grid;grid-template-columns:minmax(0,1fr) 285px;gap:5px;align-items:center;min-height:240px;border-top:1px solid #98a38b}
.cv-sheet.cv-contour .cv-spatial-kicker{color:#7a765e;margin-bottom:24px}
.cv-sheet.cv-contour .cv-name{font:400 57px/.99 Georgia,'Times New Roman',serif;letter-spacing:-2.4px;color:#344d38;max-width:370px}
.cv-sheet.cv-contour .cv-role{font:11px/1.6 ResumeInter,Arial,sans-serif;color:#68775d;margin-top:17px;max-width:340px;letter-spacing:.4px}
.cv-sheet.cv-contour .cv-contacts{font-size:8.5px;color:#7a7d6c;gap:5px 13px;margin-top:19px;max-width:360px}
.cv-sheet.cv-contour .cv-contour-drawing{display:block;width:285px;height:230px}
.cv-sheet.cv-contour .cv-contour-intro{display:grid;grid-template-columns:110px minmax(0,1fr);gap:28px;padding:22px 0 24px;border-top:1px solid #bfc5b3;border-bottom:1px solid #bfc5b3;margin-bottom:31px}
.cv-sheet.cv-contour .cv-contour-index{font:8px/1.8 monospace;letter-spacing:1px;color:#9a744d;padding-top:3px}
.cv-sheet.cv-contour .cv-contour-intro .cv-section{margin:0}
.cv-sheet.cv-contour .cv-contour-intro h2{display:none}
.cv-sheet.cv-contour .cv-contour-intro .cv-paragraph{font:400 17px/1.55 Georgia,'Times New Roman',serif;color:#56654e}
.cv-sheet.cv-contour .cv-contour-columns{display:grid;grid-template-columns:minmax(0,1fr) 182px;gap:36px}
.cv-sheet.cv-contour .cv-contour-columns main .cv-section h2{border-bottom:1px solid #c9cbbb;padding-bottom:9px}
.cv-sheet.cv-contour .cv-entry h3{font:400 16px/1.4 Georgia,'Times New Roman',serif;color:#344d38}
.cv-sheet.cv-contour .cv-paragraph,.cv-sheet.cv-contour .cv-bullets{color:#606853}
.cv-sheet.cv-contour .cv-meta{color:#9a7b55}
.cv-sheet.cv-contour .cv-contour-columns aside{border-left:1px solid #c9cbbb;padding-left:23px}
.cv-sheet.cv-contour aside .cv-entry h3{font:600 10.5px/1.6 ResumeInter,Arial,sans-serif}
.cv-sheet.cv-contour aside .cv-paragraph{font-size:9.5px;line-height:1.75}
.cv-sheet.cv-contour .cv-skill-list{color:#606853}
.cv-sheet.cv-contour .cv-contour-specimen{margin-top:18px;color:#7b886d;font:italic 11px/1.6 Georgia,'Times New Roman',serif}
.cv-sheet.cv-contour .cv-contour-specimen svg{display:block;width:125px;height:92px;margin:0 auto 12px}
.cv-sheet.cv-contour .cv-spatial-footer{color:#85907a}

.cv-sheet.cv-nocturne{padding:34px 46px 69px;background:#201a2a;color:#f0e9df;--cv-accent:#d8bc9d}
.cv-sheet.cv-nocturne .cv-nocturne-topline{display:flex;justify-content:space-between;color:#c8b6d4;border-top:1px solid #62546d;padding-top:13px;font:7px/1.5 ResumeInter,Arial,sans-serif;letter-spacing:1.5px}
.cv-sheet.cv-nocturne .cv-nocturne-header{display:grid;grid-template-columns:minmax(0,1fr) 240px;align-items:center;min-height:239px;gap:15px}
.cv-sheet.cv-nocturne .cv-name{font:400 63px/.96 Georgia,'Times New Roman',serif;color:#f0e5dc;letter-spacing:-2.8px;max-width:410px}
.cv-sheet.cv-nocturne .cv-role{font:11px/1.7 ResumeInter,Arial,sans-serif;color:#c4afcc;margin-top:20px;letter-spacing:.5px;max-width:330px}
.cv-sheet.cv-nocturne .cv-nocturne-drawing{width:240px;height:240px;display:block}
.cv-sheet.cv-nocturne .cv-nocturne-intro{display:grid;grid-template-columns:minmax(0,1fr) 174px;gap:35px;padding:23px 0 26px;border-top:1px solid #62546d;border-bottom:1px solid #62546d;margin-bottom:31px}
.cv-sheet.cv-nocturne .cv-nocturne-intro .cv-section{margin:0}
.cv-sheet.cv-nocturne .cv-nocturne-intro h2{color:#d8bc9d;margin-bottom:10px}
.cv-sheet.cv-nocturne .cv-nocturne-intro .cv-paragraph{font:400 16px/1.55 Georgia,'Times New Roman',serif;color:#e0d4df}
.cv-sheet.cv-nocturne .cv-contacts{display:grid;align-content:center;gap:9px;margin:0;font-size:9px;line-height:1.6;color:#b8a8c2;border-left:1px solid #62546d;padding-left:21px}
.cv-sheet.cv-nocturne .cv-nocturne-columns{display:grid;grid-template-columns:minmax(0,1fr) 174px;gap:35px}
.cv-sheet.cv-nocturne .cv-section h2{color:#d8bc9d}
.cv-sheet.cv-nocturne main .cv-section h2{display:flex;gap:13px;align-items:center}
.cv-sheet.cv-nocturne main .cv-section h2::after{content:'';height:1px;flex:1;background:#51445c}
.cv-sheet.cv-nocturne .cv-entry h3{color:#f0e5dc;font-weight:500}
.cv-sheet.cv-nocturne .cv-meta{color:#aa91b7}
.cv-sheet.cv-nocturne .cv-paragraph,.cv-sheet.cv-nocturne .cv-bullets,.cv-sheet.cv-nocturne .cv-skill-list{color:#c2b5cb}
.cv-sheet.cv-nocturne .cv-bullets li::marker{color:#d8bc9d}
.cv-sheet.cv-nocturne aside{border-left:1px solid #51445c;padding-left:21px}
.cv-sheet.cv-nocturne aside .cv-entry h3{font-size:10.5px}
.cv-sheet.cv-nocturne aside .cv-paragraph{font-size:9.5px}
.cv-sheet.cv-nocturne .cv-nocturne-star{display:block;color:#ba9bc6;font:88px/1 Georgia,serif;text-align:center;margin-top:32px}
.cv-sheet.cv-nocturne .cv-spatial-footer{color:#92829e}

.cv-sheet.cv-solstice{padding:35px 47px 68px;background:#f7f0e3;color:#32342d;--cv-accent:#b65032}
.cv-sheet.cv-solstice .cv-solstice-topline{display:flex;justify-content:space-between;font:7px/1.5 ResumeInter,Arial,sans-serif;letter-spacing:1.2px;color:#8d7d65;border-top:2px solid #34372d;padding-top:11px}
.cv-sheet.cv-solstice .cv-solstice-header{display:grid;grid-template-columns:minmax(0,1fr) 180px;align-items:center;gap:28px;padding:16px 0 14px}
.cv-sheet.cv-solstice .cv-name{font:450 75px/.92 ResumeInter,Arial,sans-serif;letter-spacing:-5px;color:#34372d;max-width:420px}
.cv-sheet.cv-solstice .cv-role{font:11px/1.6 ResumeInter,Arial,sans-serif;color:#b65032;letter-spacing:.3px;margin-top:24px;max-width:330px}
.cv-sheet.cv-solstice .cv-solstice-drawing{width:180px;height:200px;display:block}
.cv-sheet.cv-solstice .cv-solstice-rule{display:flex;justify-content:space-between;border-top:1px solid #b2a890;border-bottom:1px solid #b2a890;padding:10px 0;font:7px/1.4 monospace;letter-spacing:1px;color:#87775f;margin-bottom:27px}
.cv-sheet.cv-solstice .cv-solstice-columns{display:grid;grid-template-columns:171px minmax(0,1fr);gap:41px}
.cv-sheet.cv-solstice aside{border-right:1px solid #cfc4ad;padding-right:21px}
.cv-sheet.cv-solstice .cv-contacts{display:grid;font-size:9px;gap:10px;line-height:1.65;margin:0 0 29px;color:#7d725d}
.cv-sheet.cv-solstice .cv-solstice-intro{margin-bottom:26px;border-bottom:1px solid #cfc4ad;padding-bottom:18px}
.cv-sheet.cv-solstice .cv-solstice-intro .cv-section{margin:0}
.cv-sheet.cv-solstice .cv-solstice-intro h2{display:none}
.cv-sheet.cv-solstice .cv-solstice-intro .cv-paragraph{font:400 19px/1.5 Georgia,'Times New Roman',serif;color:#5d5a48}
.cv-sheet.cv-solstice .cv-entry h3{color:#3d3e31}
.cv-sheet.cv-solstice .cv-meta{color:#9d7759}
.cv-sheet.cv-solstice .cv-paragraph,.cv-sheet.cv-solstice .cv-bullets,.cv-sheet.cv-solstice .cv-skill-list{color:#6e6857}
.cv-sheet.cv-solstice aside .cv-entry h3{font-size:10px;line-height:1.6}
.cv-sheet.cv-solstice aside .cv-paragraph{font-size:9.5px;line-height:1.7}
.cv-sheet.cv-solstice .cv-spatial-footer{color:#9a8d72}

.cv-sheet.cv-aerogram{padding:39px 46px 69px;background:#fffdf7;color:#243d5d;--cv-accent:#c34d3e}
.cv-sheet.cv-aerogram .cv-aerogram-edge{position:absolute;left:0;top:0;width:100%;height:10px}
.cv-sheet.cv-aerogram .cv-aerogram-topline{display:flex;justify-content:space-between;align-items:center;font:7px/1.5 monospace;letter-spacing:1.2px;color:#305c92}
.cv-sheet.cv-aerogram .cv-aerogram-topline>span:last-child{background:#305c92;color:#fffdf7;padding:5px 9px;letter-spacing:1px}
.cv-sheet.cv-aerogram .cv-aerogram-header{display:grid;grid-template-columns:minmax(0,1fr) 140px;gap:30px;align-items:center;border-bottom:2px solid #305c92;padding:28px 0 25px}
.cv-sheet.cv-aerogram .cv-name{font:750 62px/.98 ResumeInter,Arial,sans-serif;color:#305c92;letter-spacing:-3.7px;max-width:450px}
.cv-sheet.cv-aerogram .cv-role{font:600 11px/1.6 ResumeInter,Arial,sans-serif;color:#c34d3e;margin-top:15px;max-width:390px;letter-spacing:.3px}
.cv-sheet.cv-aerogram .cv-contacts{font:8.5px/1.6 ResumeInter,Arial,sans-serif;color:#69809a;margin-top:19px;gap:5px 14px}
.cv-sheet.cv-aerogram .cv-aerogram-postmark{width:133px;height:149px;border:1px solid #c34d3e;padding:12px;text-align:center;outline:1px dashed #c34d3e;outline-offset:5px;transform:rotate(6deg);color:#c34d3e}
.cv-sheet.cv-aerogram .cv-aerogram-postmark>span{font:600 8px/1.5 ResumeInter,Arial,sans-serif;letter-spacing:1.3px;display:block}
.cv-sheet.cv-aerogram .cv-aerogram-postmark b{display:block;font:55px/.95 Georgia,serif;margin:7px 0 11px}
.cv-sheet.cv-aerogram .cv-aerogram-postmark small{font:6px/1.5 monospace;letter-spacing:.6px}
.cv-sheet.cv-aerogram .cv-aerogram-intro{display:grid;grid-template-columns:minmax(0,1fr) 224px;gap:28px;align-items:center;padding:17px 0 20px;border-bottom:1px solid #b9c5d1;margin-bottom:29px}
.cv-sheet.cv-aerogram .cv-aerogram-intro .cv-section{margin:0}
.cv-sheet.cv-aerogram .cv-aerogram-intro h2{margin-bottom:10px}
.cv-sheet.cv-aerogram .cv-aerogram-intro .cv-paragraph{font:400 16px/1.55 Georgia,'Times New Roman',serif;color:#47607b}
.cv-sheet.cv-aerogram .cv-aerogram-route{display:block;width:224px;height:130px}
.cv-sheet.cv-aerogram .cv-aerogram-columns{display:grid;grid-template-columns:minmax(0,1fr) 185px;gap:34px}
.cv-sheet.cv-aerogram .cv-aerogram-columns aside{border-left:1px dashed #b9c5d1;padding-left:22px}
.cv-sheet.cv-aerogram .cv-entry h3{color:#305c92;font-weight:650}
.cv-sheet.cv-aerogram .cv-meta{font:8.5px/1.6 monospace;color:#ba7569}
.cv-sheet.cv-aerogram .cv-paragraph,.cv-sheet.cv-aerogram .cv-bullets,.cv-sheet.cv-aerogram .cv-skill-list{color:#63778c}
.cv-sheet.cv-aerogram aside .cv-entry h3{font-size:10px;line-height:1.6}
.cv-sheet.cv-aerogram aside .cv-paragraph{font-size:9.5px}
.cv-sheet.cv-aerogram .cv-aerogram-ticket{border-top:1px solid #c34d3e;border-bottom:1px solid #c34d3e;padding:12px 0;margin-top:27px;color:#c34d3e}
.cv-sheet.cv-aerogram .cv-aerogram-ticket span{display:block;font:6.5px/1.5 monospace;letter-spacing:.7px}
.cv-sheet.cv-aerogram .cv-aerogram-ticket strong{display:block;font:400 24px/1.4 Georgia,'Times New Roman',serif;margin:5px 0 9px;color:#305c92}
.cv-sheet.cv-aerogram .cv-spatial-footer{color:#8597aa}

.cv-sheet.cv-gridline{padding:36px 49px 84px;background:#fafbf7;color:#35433b;--cv-accent:#a26640}
.cv-sheet.cv-gridline .cv-gridline-paper{position:absolute;inset:0;width:794px;height:1123px;z-index:-1;pointer-events:none}
.cv-sheet.cv-gridline .cv-gridline-frame{position:absolute;left:27px;right:27px;top:23px;bottom:26px;border:1px solid #bbc6b9;display:flex;justify-content:space-around;align-items:start;pointer-events:none}
.cv-sheet.cv-gridline .cv-gridline-frame span{background:#fafbf7;padding:0 7px;font:6px/1 monospace;color:#7d8d7c;transform:translateY(-3px)}
.cv-sheet.cv-gridline .cv-gridline-topline{display:flex;justify-content:space-between;border-bottom:1px solid #bbc6b9;padding-bottom:12px;color:#7c8a77;font:7px/1.5 monospace;letter-spacing:.5px}
.cv-sheet.cv-gridline .cv-gridline-header{display:grid;grid-template-columns:minmax(0,1fr) 217px;align-items:center;gap:22px;border-bottom:1px solid #bbc6b9;padding:17px 0 18px;min-height:220px}
.cv-sheet.cv-gridline .cv-name{font:400 57px/1 ResumeInter,Arial,sans-serif;color:#35483b;letter-spacing:-2.6px;max-width:410px}
.cv-sheet.cv-gridline .cv-role{font:9px/1.65 monospace;color:#a26640;margin-top:16px;max-width:350px}
.cv-sheet.cv-gridline .cv-contacts{font:8px/1.6 monospace;color:#7e8d7e;gap:5px 13px;margin-top:20px;max-width:380px}
.cv-sheet.cv-gridline .cv-gridline-plan{display:block;width:217px;height:202px}
.cv-sheet.cv-gridline .cv-gridline-intro{display:grid;grid-template-columns:38px minmax(0,1fr);gap:17px;border-bottom:1px solid #bbc6b9;padding:21px 0;margin-bottom:27px}
.cv-sheet.cv-gridline .cv-gridline-coordinate{font:8px/1.5 monospace;color:#a26640;letter-spacing:.5px;padding-top:3px}
.cv-sheet.cv-gridline .cv-gridline-intro .cv-section{margin:0}
.cv-sheet.cv-gridline .cv-gridline-intro h2{margin-bottom:8px}
.cv-sheet.cv-gridline .cv-gridline-columns{display:grid;grid-template-columns:minmax(0,1fr) 172px;gap:28px}
.cv-sheet.cv-gridline .cv-gridline-module{display:grid;grid-template-columns:38px minmax(0,1fr);gap:17px;margin-bottom:27px}
.cv-sheet.cv-gridline .cv-gridline-module .cv-section{margin:0}
.cv-sheet.cv-gridline .cv-gridline-columns aside{border-left:1px solid #bbc6b9;padding-left:20px}
.cv-sheet.cv-gridline .cv-section h2{font:8px/1.5 monospace;color:#a26640;letter-spacing:1px}
.cv-sheet.cv-gridline .cv-entry h3{font-size:11.2px;color:#35483b}
.cv-sheet.cv-gridline .cv-meta{font:8px/1.6 monospace;color:#8c967f}
.cv-sheet.cv-gridline .cv-paragraph,.cv-sheet.cv-gridline .cv-bullets,.cv-sheet.cv-gridline .cv-skill-list{color:#687662;font-size:10.6px;line-height:1.75}
.cv-sheet.cv-gridline aside .cv-entry h3{font-size:10px}
.cv-sheet.cv-gridline aside .cv-paragraph{font-size:9.4px}
.cv-sheet.cv-gridline .cv-gridline-titleblock{position:absolute;bottom:39px;left:49px;right:49px;display:grid;grid-template-columns:1fr 160px 90px;border:1px solid #8d9d88;font:6.5px/1.5 monospace;letter-spacing:.7px;color:#a26640}
.cv-sheet.cv-gridline .cv-gridline-titleblock>span{padding:7px 11px}
.cv-sheet.cv-gridline .cv-gridline-titleblock>span+span{border-left:1px solid #8d9d88}
.cv-sheet.cv-gridline .cv-gridline-titleblock small{display:block;font:8px/1.5 ResumeInter,Arial,sans-serif;letter-spacing:0;color:#677660;margin-top:3px}

.cv-sheet.cv-polaroid{padding:33px 46px 66px;background:#f5f1e9;color:#363c36;--cv-accent:#a3664e}
.cv-sheet.cv-polaroid .cv-polaroid-topline{display:flex;justify-content:space-between;border-top:1px solid #a8aba0;padding-top:12px;font:7px/1.5 monospace;letter-spacing:.8px;color:#8c8c79}
.cv-sheet.cv-polaroid .cv-polaroid-header{display:flex;justify-content:space-between;align-items:center;gap:25px;padding:23px 0 22px}
.cv-sheet.cv-polaroid .cv-name{font:400 59px/.99 Georgia,'Times New Roman',serif;color:#394636;letter-spacing:-2.4px;max-width:480px}
.cv-sheet.cv-polaroid .cv-role{font:10px/1.6 ResumeInter,Arial,sans-serif;color:#a3664e;margin-top:13px;letter-spacing:.4px}
.cv-sheet.cv-polaroid .cv-contacts{font-size:8px;line-height:1.6;color:#8a8c7c;margin-top:14px;gap:4px 13px}
.cv-sheet.cv-polaroid .cv-polaroid-mark{font:400 25px/.94 Georgia,'Times New Roman',serif;color:#a3664e;transform:rotate(-8deg);width:110px;flex:none;text-align:center}
.cv-sheet.cv-polaroid .cv-polaroid-mark i{font-size:34px;line-height:1.2}
.cv-sheet.cv-polaroid .cv-polaroid-gallery{position:relative;height:224px;margin:0 0 21px}
.cv-sheet.cv-polaroid .cv-polaroid-print{position:absolute;margin:0;background:#fffcf5;padding:8px 8px 13px;box-shadow:0 3px 8px #4845321a;border:1px solid #dfded3}
.cv-sheet.cv-polaroid .cv-polaroid-print img{display:block;width:100%;height:160px;object-fit:cover;background:#d6d8c8}
.cv-sheet.cv-polaroid .cv-polaroid-print figcaption{font:7px/1.4 Georgia,'Times New Roman',serif;color:#8c8975;margin-top:10px;letter-spacing:.15px;white-space:nowrap}
.cv-sheet.cv-polaroid .cv-polaroid-print-wide{width:298px;left:2px;top:8px;transform:rotate(-3deg);z-index:1}
.cv-sheet.cv-polaroid .cv-polaroid-print-wide img{object-position:50% 53%}
.cv-sheet.cv-polaroid .cv-polaroid-print-portrait{width:169px;left:289px;top:3px;transform:rotate(5deg);z-index:2}
.cv-sheet.cv-polaroid .cv-polaroid-print-portrait img{object-position:50% 30%}
.cv-sheet.cv-polaroid .cv-polaroid-print-detail{width:217px;right:2px;top:15px;transform:rotate(-2deg);z-index:3}
.cv-sheet.cv-polaroid .cv-polaroid-print-detail img{object-position:90% 50%;filter:saturate(.65)}
.cv-sheet.cv-polaroid .cv-polaroid-intro{border-top:1px solid #c4c6b6;border-bottom:1px solid #c4c6b6;padding:16px 0 18px;margin-bottom:25px}
.cv-sheet.cv-polaroid .cv-polaroid-intro .cv-section{display:grid;grid-template-columns:115px minmax(0,1fr);gap:24px;margin:0}
.cv-sheet.cv-polaroid .cv-polaroid-intro h2{padding-top:3px;margin:0}
.cv-sheet.cv-polaroid .cv-polaroid-intro .cv-paragraph{font:400 16px/1.5 Georgia,'Times New Roman',serif;color:#65705d}
.cv-sheet.cv-polaroid .cv-polaroid-columns{display:grid;grid-template-columns:minmax(0,1fr) 177px;gap:33px}
.cv-sheet.cv-polaroid .cv-polaroid-columns aside{border-left:1px solid #c4c6b6;padding-left:22px}
.cv-sheet.cv-polaroid .cv-entry h3{font-size:11.7px;color:#46513f}
.cv-sheet.cv-polaroid .cv-meta{color:#aa8874;font-size:8.5px}
.cv-sheet.cv-polaroid .cv-paragraph,.cv-sheet.cv-polaroid .cv-bullets,.cv-sheet.cv-polaroid .cv-skill-list{font-size:10.5px;line-height:1.7;color:#78806d}
.cv-sheet.cv-polaroid .cv-entry{margin-bottom:17px}
.cv-sheet.cv-polaroid .cv-section{margin-bottom:22px}
.cv-sheet.cv-polaroid aside .cv-entry h3{font-size:10px;line-height:1.5}
.cv-sheet.cv-polaroid aside .cv-paragraph{font-size:9px}
.cv-sheet.cv-polaroid .cv-spatial-footer{color:#9da28e}
`;
