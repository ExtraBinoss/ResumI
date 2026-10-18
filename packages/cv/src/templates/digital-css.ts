/** Portable document styles: each rule belongs to one of the five digital sheets. */
export const digitalCss = `
.cv-sheet.cv-terminal{padding:30px 29px 61px;background:#101b18;color:#d1ddd4;font-family:ResumeInter,Arial,sans-serif}
.cv-sheet.cv-terminal .cv-terminal-bar{display:flex;justify-content:space-between;align-items:center;border:1px solid #3a4b40;border-bottom:0;padding:10px 15px;font:9px/1.3 monospace;color:#8d9d90}
.cv-sheet.cv-terminal .cv-terminal-bar>span:first-child{color:#b8ec72;letter-spacing:3px}
.cv-sheet.cv-terminal .cv-terminal-body{display:grid;grid-template-columns:174px minmax(0,1fr);border:1px solid #3a4b40;min-height:960px}
.cv-sheet.cv-terminal .cv-terminal-rail{padding:27px 20px;background:#15221b;border-right:1px solid #3a4b40}
.cv-sheet.cv-terminal .cv-terminal-ascii{margin:0 0 25px;color:#b8ec72;font:700 18px/1.1 monospace;white-space:pre}
.cv-sheet.cv-terminal .cv-terminal-tree{display:grid;gap:7px;color:#93a58d;font:8.8px/1.45 monospace;margin-bottom:29px;white-space:nowrap}
.cv-sheet.cv-terminal .cv-terminal-tree>span:first-child{color:#b8ec72}
.cv-sheet.cv-terminal .cv-contacts{display:grid;gap:9px;color:#c0cfc1;font:9px/1.6 monospace;margin:0 0 31px;overflow-wrap:anywhere}
.cv-sheet.cv-terminal .cv-terminal-main{padding:29px 27px 34px}
.cv-sheet.cv-terminal .cv-digital-label{font:10px/1.4 monospace;color:#b8ec72;display:block;margin-bottom:18px}
.cv-sheet.cv-terminal .cv-name{font:600 42px/1.06 ResumeInter,Arial,sans-serif;letter-spacing:-2px;color:#ecf4e9;max-width:350px}
.cv-sheet.cv-terminal .cv-role{font:11px/1.6 monospace;color:#b8ec72;margin-top:13px;max-width:300px}
.cv-sheet.cv-terminal .cv-terminal-intro{padding:21px 0 23px;margin:25px 0 27px;border-top:1px solid #3a4b40;border-bottom:1px solid #3a4b40}
.cv-sheet.cv-terminal .cv-terminal-intro .cv-section{margin:0}
.cv-sheet.cv-terminal .cv-section{margin-bottom:27px}
.cv-sheet.cv-terminal .cv-section h2{font:600 9px/1.4 monospace;color:#b8ec72;letter-spacing:1.3px;margin-bottom:14px}
.cv-sheet.cv-terminal .cv-section h2::before{content:'./';color:#7a8d71;margin-right:4px}
.cv-sheet.cv-terminal .cv-entry{margin-bottom:23px}
.cv-sheet.cv-terminal .cv-entry-head{display:block;margin-bottom:9px}
.cv-sheet.cv-terminal .cv-entry h3{font-size:12px;line-height:1.5;color:#e2ecdf;font-weight:600}
.cv-sheet.cv-terminal .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:5px}
.cv-sheet.cv-terminal .cv-meta{font:9px/1.5 monospace;color:#95ab98}
.cv-sheet.cv-terminal .cv-paragraph,.cv-sheet.cv-terminal .cv-bullets{font-size:11.1px;line-height:1.75;color:#bdcdbf}
.cv-sheet.cv-terminal .cv-bullets{padding-left:13px}
.cv-sheet.cv-terminal .cv-bullets li{padding-left:3px;margin-bottom:8px}
.cv-sheet.cv-terminal .cv-bullets li::marker{color:#b8ec72}
.cv-sheet.cv-terminal .cv-skill-list{grid-template-columns:1fr;gap:8px;font:10px/1.5 monospace;color:#c8d7c7}
.cv-sheet.cv-terminal .cv-terminal-rail .cv-section{margin-bottom:29px}
.cv-sheet.cv-terminal .cv-terminal-rail .cv-entry h3{font-size:10.8px;line-height:1.6}
.cv-sheet.cv-terminal .cv-terminal-rail .cv-paragraph{font-size:10px;line-height:1.7}
.cv-sheet.cv-terminal .cv-digital-footer{position:absolute;bottom:27px;left:30px;right:30px;display:flex;justify-content:space-between;font:8px/1.4 monospace;color:#9cb18f;letter-spacing:.3px}

.cv-sheet.cv-mainframe{padding:0;background:#f6f0df;color:#332d21;font-family:monospace}
.cv-sheet.cv-mainframe .cv-mainframe-perforations{position:absolute;left:0;top:0;bottom:0;width:29px;border-right:1px dashed #c3bba7;display:flex;flex-direction:column;justify-content:space-around;align-items:center;padding:12px 0}
.cv-sheet.cv-mainframe .cv-mainframe-perforations i{width:10px;height:16px;border:1px solid #c3bba7;border-radius:4px;background:#ded8c8}
.cv-sheet.cv-mainframe .cv-mainframe-page{display:grid;padding:39px 44px 34px 64px}
.cv-sheet.cv-mainframe .cv-mainframe-page>*,.cv-sheet.cv-mainframe .cv-mainframe-header>*{z-index:0}
.cv-sheet.cv-mainframe .cv-mainframe-header{display:grid;grid-template-columns:minmax(0,1fr) auto;border-top:12px solid #bd762a;border-bottom:1px solid #534a37;padding:27px 0 21px;margin-bottom:27px}
.cv-sheet.cv-mainframe .cv-mainframe-stamp{grid-column:2;grid-row:1;align-self:start;margin-top:-4px;border:1px solid #bd762a;padding:8px 10px;font:9px/1.6 monospace;letter-spacing:.7px;color:#89551d;transform:rotate(3deg)}
.cv-sheet.cv-mainframe .cv-digital-identity{grid-column:1;grid-row:1}
.cv-sheet.cv-mainframe .cv-name{font:700 43px/1.1 monospace;letter-spacing:-2.6px;color:#332d21;max-width:470px}
.cv-sheet.cv-mainframe .cv-role{font:11px/1.6 monospace;letter-spacing:.2px;color:#85561f;margin-top:11px;max-width:460px}
.cv-sheet.cv-mainframe .cv-contacts{grid-column:1/-1;font:9.5px/1.5 monospace;color:#615844;margin-top:19px;gap:8px 17px}
.cv-sheet.cv-mainframe main>.cv-section{display:grid;grid-template-columns:104px minmax(0,1fr);gap:20px;border-bottom:1px dashed #bfb49b;padding-bottom:22px;margin-bottom:23px}
.cv-sheet.cv-mainframe main>.cv-section:last-child{margin-bottom:0}
.cv-sheet.cv-mainframe .cv-section h2{font:700 9px/1.5 monospace;letter-spacing:.6px;color:#85561f;margin-bottom:12px}
.cv-sheet.cv-mainframe main>.cv-section h2{padding-top:4px}
.cv-sheet.cv-mainframe main>.cv-section h2::before{content:'>';margin-right:7px}
.cv-sheet.cv-mainframe .cv-entry-head{display:block;margin-bottom:7px}
.cv-sheet.cv-mainframe .cv-entry h3{font:700 12px/1.45 monospace;color:#332d21}
.cv-sheet.cv-mainframe .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:4px}
.cv-sheet.cv-mainframe .cv-meta{font:9px/1.5 monospace;color:#7b6d54}
.cv-sheet.cv-mainframe .cv-entry{margin-bottom:18px}
.cv-sheet.cv-mainframe .cv-paragraph,.cv-sheet.cv-mainframe .cv-bullets{font:11px/1.7 monospace;color:#514934}
.cv-sheet.cv-mainframe .cv-bullets{padding-left:13px}
.cv-sheet.cv-mainframe .cv-bullets li{padding-left:1px;margin-bottom:6px}
.cv-sheet.cv-mainframe .cv-bullets li::marker{color:#9f6727}
.cv-sheet.cv-mainframe .cv-mainframe-bottom{display:grid;grid-template-columns:1.15fr 1fr .8fr;gap:23px;margin-top:26px}
.cv-sheet.cv-mainframe .cv-mainframe-bottom .cv-section{margin:0}
.cv-sheet.cv-mainframe .cv-skill-list{grid-template-columns:1fr;gap:3px;font:9.7px/1.65 monospace;color:#514934}
.cv-sheet.cv-mainframe .cv-mainframe-bottom .cv-entry h3{font-size:10.1px}
.cv-sheet.cv-mainframe .cv-mainframe-bottom .cv-paragraph{font-size:9.5px;line-height:1.65}
.cv-sheet.cv-mainframe .cv-mainframe-rule{display:flex;gap:15px;align-items:center;justify-content:space-between;margin-top:28px;font:8px/1.5 monospace;letter-spacing:1px;color:#85561f;white-space:nowrap}
.cv-sheet.cv-mainframe .cv-mainframe-rule>span{overflow:hidden;letter-spacing:0;color:#b8a888}

.cv-sheet.cv-arcade{padding:41px 43px 62px;background:#fff9e9;color:#292d3b}
.cv-sheet.cv-arcade .cv-arcade-header{display:grid;grid-template-columns:minmax(0,1fr) 225px;gap:21px;align-items:center;padding-bottom:25px;border-bottom:3px solid #292d3b;margin-bottom:25px}
.cv-sheet.cv-arcade .cv-digital-label{display:block;font:700 8px/1.4 monospace;letter-spacing:1.5px;color:#6d5589;margin-bottom:16px}
.cv-sheet.cv-arcade .cv-name{font:750 44px/1.02 ResumeInter,Arial,sans-serif;letter-spacing:-2.3px;color:#292d3b;max-width:370px}
.cv-sheet.cv-arcade .cv-role{font:700 11px/1.5 monospace;color:#6d5589;margin-top:13px;max-width:330px}
.cv-sheet.cv-arcade .cv-contacts{font:9px/1.5 monospace;color:#53515d;gap:6px 13px;margin-top:16px}
.cv-sheet.cv-arcade .cv-pixel-garden{display:block;width:225px;height:auto;border:3px solid #292d3b;box-shadow:6px 6px 0 #292d3b}
.cv-sheet.cv-arcade .cv-arcade-intro{display:flex;align-items:center;gap:22px;background:#ede7fa;border:2px solid #292d3b;padding:18px 22px;margin-bottom:27px;box-shadow:4px 4px 0 #c8c4ee}
.cv-sheet.cv-arcade .cv-arcade-intro .cv-section{margin:0}
.cv-sheet.cv-arcade .cv-arcade-intro .cv-section h2{margin-bottom:8px}
.cv-sheet.cv-arcade .cv-arcade-spark{font:44px/1 Georgia,serif;color:#82649b;flex:none}
.cv-sheet.cv-arcade .cv-arcade-grid{display:grid;grid-template-columns:minmax(0,1fr) 188px;gap:30px}
.cv-sheet.cv-arcade .cv-arcade-grid aside{border:2px solid #292d3b;align-self:start;padding:19px 16px 17px;background:#f7e9bf;box-shadow:5px 5px 0 #f0bd70}
.cv-sheet.cv-arcade .cv-section{margin-bottom:26px}
.cv-sheet.cv-arcade .cv-section h2{font:700 10px/1.4 monospace;letter-spacing:.8px;text-transform:uppercase;color:#64487a;margin-bottom:14px}
.cv-sheet.cv-arcade .cv-arcade-grid main .cv-section h2{border-bottom:2px solid #c8c4ee;padding-bottom:8px}
.cv-sheet.cv-arcade .cv-entry-head{display:block;margin-bottom:8px}
.cv-sheet.cv-arcade .cv-entry h3{font-size:12px;line-height:1.5;color:#292d3b;font-weight:700}
.cv-sheet.cv-arcade .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:4px}
.cv-sheet.cv-arcade .cv-meta{font:9px/1.5 monospace;color:#77637a}
.cv-sheet.cv-arcade .cv-entry{margin-bottom:21px}
.cv-sheet.cv-arcade .cv-paragraph,.cv-sheet.cv-arcade .cv-bullets{font-size:11px;line-height:1.75;color:#4f4b56}
.cv-sheet.cv-arcade .cv-bullets{padding-left:13px}
.cv-sheet.cv-arcade .cv-bullets li{padding-left:2px;margin-bottom:7px}
.cv-sheet.cv-arcade .cv-bullets li::marker{color:#82649b;content:'▪  '}
.cv-sheet.cv-arcade .cv-skill-list{grid-template-columns:1fr;gap:7px;font:10px/1.55 monospace;color:#554c3b}
.cv-sheet.cv-arcade .cv-arcade-grid aside .cv-entry h3{font-size:10.8px}
.cv-sheet.cv-arcade .cv-arcade-grid aside .cv-paragraph{font-size:10px}
.cv-sheet.cv-arcade .cv-arcade-mini-art{display:flex;gap:6px;align-items:end;justify-content:center;padding-top:2px;height:70px}
.cv-sheet.cv-arcade .cv-arcade-mini-art i{display:block;width:11px;background:#82649b;border-top:4px solid #292d3b}
.cv-sheet.cv-arcade .cv-arcade-mini-art i:nth-child(2n){background:#e78b78}
.cv-sheet.cv-arcade .cv-digital-footer{position:absolute;bottom:26px;left:43px;right:43px;display:flex;justify-content:space-between;font:8px/1.5 monospace;color:#77637a;letter-spacing:.6px}

.cv-sheet.cv-blueprint{padding:37px 42px 73px;background-color:#163c58;background-image:linear-gradient(#72bcd00b 1px,transparent 1px),linear-gradient(90deg,#72bcd00b 1px,transparent 1px);background-size:18px 18px;color:#e7f5f5}
.cv-sheet.cv-blueprint .cv-blueprint-header{display:grid;grid-template-columns:minmax(0,1fr) 225px;gap:16px;align-items:center;border-top:1px solid #75b9ce;border-bottom:1px solid #75b9ce;padding:21px 0 25px;margin-bottom:0}
.cv-sheet.cv-blueprint .cv-digital-label{display:block;font:8px/1.4 monospace;letter-spacing:2px;color:#f2cc82;margin-bottom:21px}
.cv-sheet.cv-blueprint .cv-name{font:550 44px/1.05 ResumeInter,Arial,sans-serif;letter-spacing:-2px;color:#f2f6f4;max-width:380px}
.cv-sheet.cv-blueprint .cv-role{font:10px/1.6 monospace;color:#99d4df;margin-top:13px;max-width:350px}
.cv-sheet.cv-blueprint .cv-contacts{font:8.8px/1.5 monospace;color:#b4d2dc;gap:6px 16px;margin-top:19px}
.cv-sheet.cv-blueprint .cv-blueprint-diagram{display:block;width:225px;height:198px}
.cv-sheet.cv-blueprint .cv-blueprint-intro{display:grid;grid-template-columns:45px minmax(0,1fr);gap:17px;border-bottom:1px solid #75b9ce;padding:21px 0;margin-bottom:25px}
.cv-sheet.cv-blueprint .cv-blueprint-intro .cv-section{margin:0}
.cv-sheet.cv-blueprint .cv-blueprint-intro .cv-section h2{margin-bottom:7px}
.cv-sheet.cv-blueprint .cv-blueprint-coordinate{display:block;font:9px/1.5 monospace;color:#f2cc82;padding-top:1px}
.cv-sheet.cv-blueprint .cv-blueprint-grid{display:grid;grid-template-columns:minmax(0,1fr) 178px;gap:24px}
.cv-sheet.cv-blueprint .cv-blueprint-module{display:grid;grid-template-columns:25px minmax(0,1fr);gap:13px;margin-bottom:26px}
.cv-sheet.cv-blueprint .cv-blueprint-module>.cv-section{margin-bottom:0}
.cv-sheet.cv-blueprint .cv-blueprint-grid aside{border-left:1px solid #54869e;padding-left:18px}
.cv-sheet.cv-blueprint .cv-section{margin-bottom:27px}
.cv-sheet.cv-blueprint .cv-section h2{font:10px/1.4 monospace;color:#a9e6ee;letter-spacing:1px;margin-bottom:14px}
.cv-sheet.cv-blueprint .cv-entry{margin-bottom:20px}
.cv-sheet.cv-blueprint .cv-entry-head{display:block;margin-bottom:7px}
.cv-sheet.cv-blueprint .cv-entry h3{font-size:11.5px;line-height:1.5;color:#f1f8f7;font-weight:600}
.cv-sheet.cv-blueprint .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:4px}
.cv-sheet.cv-blueprint .cv-meta{font:8.8px/1.5 monospace;color:#9ac0d2}
.cv-sheet.cv-blueprint .cv-paragraph,.cv-sheet.cv-blueprint .cv-bullets{font-size:10.8px;line-height:1.75;color:#c4dde4}
.cv-sheet.cv-blueprint .cv-bullets{padding-left:12px}
.cv-sheet.cv-blueprint .cv-bullets li{padding-left:1px;margin-bottom:7px}
.cv-sheet.cv-blueprint .cv-bullets li::marker{color:#f2cc82}
.cv-sheet.cv-blueprint .cv-skill-list{grid-template-columns:1fr;gap:7px;font:10px/1.55 monospace;color:#c4dde4}
.cv-sheet.cv-blueprint .cv-blueprint-grid aside .cv-entry h3{font-size:10.5px}
.cv-sheet.cv-blueprint .cv-blueprint-grid aside .cv-paragraph{font-size:9.7px}
.cv-sheet.cv-blueprint .cv-blueprint-titleblock{position:absolute;left:42px;right:42px;bottom:29px;display:grid;grid-template-columns:1fr 1.6fr 69px;border:1px solid #75b9ce;font:8px/1.5 monospace;color:#a9d9e6}
.cv-sheet.cv-blueprint .cv-blueprint-titleblock>span{padding:8px 11px}
.cv-sheet.cv-blueprint .cv-blueprint-titleblock>span+span{border-left:1px solid #75b9ce}

.cv-sheet.cv-orbit{padding:36px 49px 67px;background:#f5f5ed;color:#243d36}
.cv-sheet.cv-orbit .cv-orbit-header{display:grid;grid-template-columns:minmax(0,1fr) 237px;gap:20px;align-items:center;min-height:208px}
.cv-sheet.cv-orbit .cv-digital-label{display:block;font:8px/1.4 monospace;letter-spacing:2px;color:#9b553f;margin-bottom:23px}
.cv-sheet.cv-orbit .cv-name{font:400 58px/.98 Georgia,'Times New Roman',serif;letter-spacing:-2.7px;color:#203f39;max-width:390px}
.cv-sheet.cv-orbit .cv-role{font-size:14px;line-height:1.45;color:#637b6e;margin-top:15px;max-width:330px}
.cv-sheet.cv-orbit .cv-contacts{font-size:9px;line-height:1.6;color:#64776e;gap:5px 16px;margin-top:20px}
.cv-sheet.cv-orbit .cv-orbit-diagram{display:block;width:237px;height:208px}
.cv-sheet.cv-orbit .cv-orbit-intro{margin:16px 0 20px;border-top:1px solid #bfcac0;border-bottom:1px solid #bfcac0;padding:16px 0}
.cv-sheet.cv-orbit .cv-orbit-intro .cv-section{display:grid;grid-template-columns:113px minmax(0,1fr);gap:22px;margin:0}
.cv-sheet.cv-orbit .cv-orbit-intro .cv-section h2{padding-top:4px;margin:0}
.cv-sheet.cv-orbit .cv-orbit-intro .cv-paragraph{font-size:12px;line-height:1.8}
.cv-sheet.cv-orbit .cv-orbit-main>.cv-section{display:grid;grid-template-columns:113px minmax(0,1fr);gap:22px;margin-bottom:25px}
.cv-sheet.cv-orbit .cv-section h2{font:9px/1.4 monospace;letter-spacing:1px;color:#9b553f;margin-bottom:14px}
.cv-sheet.cv-orbit .cv-orbit-main>.cv-section h2{padding-top:5px}
.cv-sheet.cv-orbit .cv-orbit-main .cv-section-content{border-left:1px solid #b9c7bc;padding-left:21px}
.cv-sheet.cv-orbit .cv-entry{margin-bottom:16px}
.cv-sheet.cv-orbit .cv-orbit-main .cv-entry::before{content:'';float:left;margin-left:-25px;margin-top:7px;width:7px;height:7px;border:1px solid #9b553f;border-radius:50%;background:#f5f5ed}
.cv-sheet.cv-orbit .cv-entry-head{display:block;margin-bottom:7px}
.cv-sheet.cv-orbit .cv-entry h3{font:400 15px/1.4 Georgia,'Times New Roman',serif;color:#203f39}
.cv-sheet.cv-orbit .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:4px}
.cv-sheet.cv-orbit .cv-meta{font:8.8px/1.5 monospace;color:#78877a}
.cv-sheet.cv-orbit .cv-paragraph,.cv-sheet.cv-orbit .cv-bullets{font-size:11px;line-height:1.75;color:#52655b}
.cv-sheet.cv-orbit .cv-bullets{padding-left:12px}
.cv-sheet.cv-orbit .cv-bullets li{padding-left:1px;margin-bottom:6px}
.cv-sheet.cv-orbit .cv-bullets li::marker{color:#9b553f}
.cv-sheet.cv-orbit .cv-orbit-bottom{display:grid;grid-template-columns:1.1fr 1fr .8fr;gap:27px;padding-top:17px;border-top:1px solid #bfcac0;margin-top:22px}
.cv-sheet.cv-orbit .cv-orbit-bottom .cv-section{margin-bottom:0}
.cv-sheet.cv-orbit .cv-orbit-bottom .cv-entry h3{font-size:12.6px}
.cv-sheet.cv-orbit .cv-orbit-bottom .cv-paragraph{font-size:9.5px;line-height:1.7}
.cv-sheet.cv-orbit .cv-skill-list{grid-template-columns:1fr;gap:4px;font-size:10px;line-height:1.55;color:#52655b}
.cv-sheet.cv-orbit .cv-digital-footer{position:absolute;bottom:26px;left:49px;right:49px;display:flex;justify-content:space-between;font:7.5px/1.5 monospace;letter-spacing:.3px;color:#78877a}
`;
