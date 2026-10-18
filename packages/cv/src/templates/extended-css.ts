/** Scoped document CSS: no application or browser-global text rules. */
export const extendedCss = `
.cv-sheet .cv-tools{display:flex;flex-wrap:wrap;gap:12px;margin-top:25px}
.cv-sheet .cv-tool{display:flex;align-items:center;gap:7px;font-size:10px;line-height:1.3;color:#37434b}
.cv-sheet .cv-tool svg{flex:none}
.cv-sheet .cv-page-mark{display:flex;justify-content:space-between;position:absolute;bottom:31px;left:49px;right:49px;font-size:8.5px;letter-spacing:.7px;color:#7c858c}
.cv-sheet .cv-index-label{display:block;font-size:9px;line-height:1.4;letter-spacing:2px;font-weight:600}
.cv-sheet.cv-harvard{padding:48px 57px;font:14px/1.42 Georgia,'Times New Roman',serif;letter-spacing:0;color:#111}
.cv-sheet.cv-harvard .cv-header{text-align:center;padding-bottom:0;margin-bottom:24px;border:0}
.cv-sheet.cv-harvard .cv-name{font:700 26px/1.15 Georgia,'Times New Roman',serif;letter-spacing:.1px;color:#111;border-bottom:1px solid #111;padding-bottom:8px}
.cv-sheet.cv-harvard .cv-role{display:none}
.cv-sheet.cv-harvard .cv-contacts{justify-content:center;gap:4px 13px;margin-top:6px;font:12px/1.4 Georgia,'Times New Roman',serif;color:#111}
.cv-sheet.cv-harvard .cv-contacts svg{display:none}
.cv-sheet.cv-harvard .cv-section{margin-bottom:23px}
.cv-sheet.cv-harvard .cv-section h2{text-align:center;text-transform:none;letter-spacing:0;font:700 14px/1.3 Georgia,'Times New Roman',serif;color:#111;margin-bottom:10px}
.cv-sheet.cv-harvard .cv-entry{margin-bottom:16px}
.cv-sheet.cv-harvard .cv-entry-head{gap:15px;margin-bottom:4px}
.cv-sheet.cv-harvard .cv-entry h3{font:700 14px/1.4 Georgia,'Times New Roman',serif;color:#111}
.cv-sheet.cv-harvard .cv-meta{font:12.5px/1.4 Georgia,'Times New Roman',serif;color:#111}
.cv-sheet.cv-harvard .cv-paragraph,.cv-sheet.cv-harvard .cv-bullets{font:13px/1.48 Georgia,'Times New Roman',serif;color:#111}
.cv-sheet.cv-harvard .cv-bullets{padding-left:18px}
.cv-sheet.cv-harvard .cv-bullets li{padding-left:0;margin-bottom:4px}
.cv-sheet.cv-harvard .cv-bullets li::marker{color:#111;font-size:9px}
.cv-sheet.cv-harvard .cv-skill-list{display:block;font:13px/1.55 Georgia,'Times New Roman',serif;color:#111}
.cv-sheet.cv-harvard .cv-skill-list li{display:inline}
.cv-sheet.cv-harvard .cv-skill-list li:not(:last-child)::after{content:' · '}
.cv-sheet.cv-cobalt{padding:0 0 65px}
.cv-sheet .cv-cobalt-header{padding:47px 49px 33px;background:#174bc5;color:#fff}
.cv-sheet .cv-cobalt-heading{display:flex;justify-content:space-between;align-items:center;gap:20px}
.cv-sheet.cv-cobalt .cv-name{font-size:47px;color:#fff;letter-spacing:-2px}
.cv-sheet.cv-cobalt .cv-role{color:#d7e5ff;font-size:16px;margin-top:10px}
.cv-sheet .cv-monogram{display:grid;place-items:center;width:66px;height:66px;border:1px solid #ffffff70;border-radius:50%;font-size:24px;font-weight:500;letter-spacing:-1px}
.cv-sheet.cv-cobalt .cv-contacts{color:#e5edff;margin-top:25px;font-size:10.5px;gap:10px 20px}
.cv-sheet.cv-cobalt .cv-contacts svg{color:#d5e3ff}
.cv-sheet .cv-cobalt-body{display:grid;grid-template-columns:minmax(0,1fr) 194px;gap:31px;padding:34px 49px 0}
.cv-sheet .cv-cobalt-body aside{border-left:1px solid #dbe3ef;padding-left:23px}
.cv-sheet.cv-cobalt .cv-section{margin-bottom:25px}
.cv-sheet.cv-cobalt .cv-section h2{color:#174bc5;letter-spacing:1.5px;font-size:10px;margin-bottom:13px}
.cv-sheet.cv-cobalt .cv-entry-head{display:block}
.cv-sheet.cv-cobalt .cv-entry h3{font-size:13.5px}
.cv-sheet.cv-cobalt .cv-entry-head .cv-meta{max-width:none;text-align:left;font-size:10.4px;margin-top:4px}
.cv-sheet.cv-cobalt .cv-paragraph,.cv-sheet.cv-cobalt .cv-bullets{font-size:12.2px;line-height:1.7}
.cv-sheet .cv-cobalt-body aside .cv-skill-list{grid-template-columns:1fr;gap:6px;font-size:11.5px}
.cv-sheet .cv-cobalt-body aside .cv-entry h3{font-size:11.7px}
.cv-sheet .cv-cobalt-body aside .cv-meta,.cv-sheet .cv-cobalt-body aside .cv-paragraph{font-size:10.8px}
.cv-sheet.cv-atelier{padding:0;display:grid;grid-template-columns:240px minmax(0,1fr);background:#fffdf9;min-height:1123px}
.cv-sheet .cv-atelier-rail{position:relative;padding:46px 30px 70px;background:#eadfd0;min-height:1123px;overflow:hidden}
.cv-sheet .cv-atelier-portrait{width:164px;height:188px;object-fit:cover;object-position:50% 43%;border-radius:83px 83px 5px 5px;display:block;margin:0 auto 29px}
.cv-sheet .cv-atelier-rail .cv-contacts{display:grid;gap:12px;margin:0 0 31px;font-size:10.3px;color:#584d42}
.cv-sheet .cv-atelier-rail .cv-contacts svg{color:#895a40}
.cv-sheet .cv-atelier-rail .cv-section{margin-bottom:28px}
.cv-sheet .cv-atelier-rail .cv-section h2{color:#714d39;font-size:9.5px;letter-spacing:1.5px}
.cv-sheet .cv-atelier-rail .cv-entry-head{display:block}
.cv-sheet .cv-atelier-rail .cv-entry h3{font-size:11.8px;color:#483d33}
.cv-sheet .cv-atelier-rail .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:6px}
.cv-sheet .cv-atelier-rail .cv-skill-list{grid-template-columns:1fr;gap:7px;font-size:11.5px;color:#584d42}
.cv-sheet .cv-atelier-rail .cv-paragraph{font-size:11px;color:#584d42}
.cv-sheet .cv-atelier-main{position:relative;padding:59px 39px 60px}
.cv-sheet.cv-atelier .cv-header{border:0;padding-bottom:23px;margin-bottom:27px}
.cv-sheet.cv-atelier .cv-name{font:400 50px/1.02 Georgia,'Times New Roman',serif;letter-spacing:-2px;color:#533e30;max-width:260px}
.cv-sheet.cv-atelier .cv-role{margin-top:17px;font-size:14px;color:#95694b}
.cv-sheet .cv-atelier-main .cv-section{margin-bottom:28px}
.cv-sheet .cv-atelier-main .cv-section h2{font-size:9.8px;color:#95694b;letter-spacing:1.6px;border-top:1px solid #d9cbbc;padding-top:14px}
.cv-sheet .cv-atelier-main .cv-entry-head{display:block}
.cv-sheet .cv-atelier-main .cv-entry h3{font:400 18px/1.4 Georgia,'Times New Roman',serif;color:#533e30}
.cv-sheet .cv-atelier-main .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:5px;font-size:10px}
.cv-sheet .cv-atelier-main .cv-paragraph,.cv-sheet .cv-atelier-main .cv-bullets{font-size:11.8px;line-height:1.75;color:#5b5148}
.cv-sheet .cv-atelier-circle{position:absolute;border:1px solid #b49375;width:270px;height:270px;border-radius:50%;bottom:-170px;left:-70px;pointer-events:none}
.cv-sheet.cv-timeline{padding:49px 50px 68px;background:#fafbfa}
.cv-sheet .cv-timeline-header{padding-bottom:26px;border-bottom:1px solid #b7ccc5;overflow:hidden}
.cv-sheet.cv-timeline .cv-index-label{color:#357560;margin-bottom:24px}
.cv-sheet.cv-timeline .cv-name{font-size:56px;letter-spacing:-2.8px;color:#204c3e;max-width:530px}
.cv-sheet.cv-timeline .cv-role{color:#3f7663;margin-top:12px;font-size:16px}
.cv-sheet.cv-timeline .cv-contacts{margin-top:23px;gap:7px 18px;color:#566d63}
.cv-sheet .cv-orbit{position:absolute;right:55px;top:53px;width:107px;height:107px;transform:rotate(-30deg);pointer-events:none}
.cv-sheet .cv-orbit i{position:absolute;inset:8px;border:1px solid #8baea0;border-radius:50%}
.cv-sheet .cv-orbit i:nth-child(2){inset:23px}
.cv-sheet .cv-orbit i:nth-child(3){inset:38px;background:#c7ddce;border:0}
.cv-sheet .cv-timeline-intro{margin:25px 0 26px;max-width:610px}
.cv-sheet .cv-timeline-intro .cv-section h2{display:none}
.cv-sheet .cv-timeline-intro .cv-paragraph{font-size:13.3px;line-height:1.8;color:#405c4f}
.cv-sheet .cv-timeline-columns{display:grid;grid-template-columns:minmax(0,1fr) 177px;gap:39px}
.cv-sheet.cv-timeline .cv-section h2{color:#357560;font-size:9.7px;letter-spacing:1.55px}
.cv-sheet .cv-timeline-columns main .cv-section-content{border-left:1px solid #b7ccc5;padding-left:20px}
.cv-sheet .cv-timeline-columns main .cv-entry{margin-bottom:24px}
.cv-sheet .cv-timeline-columns main .cv-entry::before{content:'';width:7px;height:7px;float:left;margin-left:-24px;margin-top:7px;border:1.5px solid #357560;border-radius:50%;background:#fafbfa;box-sizing:border-box}
.cv-sheet.cv-timeline .cv-entry-head{display:block}
.cv-sheet.cv-timeline .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:5px;font-size:10px}
.cv-sheet.cv-timeline .cv-entry h3{font-size:12.6px;color:#254b3e}
.cv-sheet.cv-timeline .cv-paragraph,.cv-sheet.cv-timeline .cv-bullets{font-size:11.7px;line-height:1.75}
.cv-sheet .cv-timeline-columns aside .cv-skill-list{grid-template-columns:1fr;gap:7px;font-size:11px}
.cv-sheet .cv-timeline-columns aside .cv-entry h3{font-size:11.5px}
.cv-sheet .cv-timeline-columns aside .cv-paragraph{font-size:10.8px}
.cv-sheet.cv-consultant{padding:50px 51px 70px;color:#273237}
.cv-sheet .cv-consultant-header{display:grid;grid-template-columns:minmax(0,1fr) 178px;gap:22px;align-items:end;border-top:5px solid #273237;border-bottom:1px solid #b8c0c2;padding:20px 0 26px;margin-bottom:27px}
.cv-sheet.cv-consultant .cv-index-label{font-size:8px;letter-spacing:1.6px;color:#7d6553;margin-bottom:21px}
.cv-sheet.cv-consultant .cv-name{font:400 50px/1.04 Georgia,'Times New Roman',serif;letter-spacing:-2px;color:#273237}
.cv-sheet.cv-consultant .cv-role{font-size:13px;letter-spacing:.2px;color:#7d6553;margin-top:12px}
.cv-sheet.cv-consultant .cv-contacts{display:grid;gap:10px;margin:0;font-size:10px;overflow-wrap:anywhere}
.cv-sheet.cv-consultant .cv-contacts svg{display:none}
.cv-sheet .cv-consultant-section{display:grid;grid-template-columns:37px minmax(0,1fr);gap:12px;margin-bottom:25px}
.cv-sheet .cv-section-number{font-size:10px;line-height:1.3;font-weight:600;letter-spacing:1px;color:#a99077;padding-top:1px}
.cv-sheet.cv-consultant .cv-section{margin:0}
.cv-sheet.cv-consultant .cv-section h2{font-size:9.8px;letter-spacing:1.5px;color:#7d6553;margin-bottom:14px}
.cv-sheet.cv-consultant .cv-entry{margin-bottom:20px}
.cv-sheet.cv-consultant .cv-entry h3{font-size:13.1px}
.cv-sheet.cv-consultant .cv-entry-head .cv-meta{font-size:10px}
.cv-sheet.cv-consultant .cv-paragraph,.cv-sheet.cv-consultant .cv-bullets{font-size:12px;line-height:1.7}
.cv-sheet .cv-consultant-footer{display:grid;grid-template-columns:1.1fr 1.25fr .8fr;gap:20px;padding:20px 0 0 49px;border-top:1px solid #cbd0d1}
.cv-sheet .cv-consultant-footer .cv-entry-head{display:block}
.cv-sheet .cv-consultant-footer .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:5px}
.cv-sheet .cv-consultant-footer .cv-skill-list{grid-template-columns:1fr;gap:5px;font-size:10px}
.cv-sheet .cv-consultant-footer .cv-paragraph{font-size:10.5px}
.cv-sheet.cv-mosaic{padding:46px 48px 69px;color:#323343}
.cv-sheet .cv-mosaic-header{display:grid;grid-template-columns:minmax(0,1fr) 156px;gap:25px;align-items:start;margin-bottom:25px}
.cv-sheet.cv-mosaic .cv-name{font-size:51px;line-height:1.04;letter-spacing:-2.5px;color:#343246;max-width:360px}
.cv-sheet.cv-mosaic .cv-role{font-size:15px;color:#725b9a;margin-top:14px}
.cv-sheet.cv-mosaic .cv-contacts{display:grid;gap:7px;margin-top:21px;font-size:10px}
.cv-sheet.cv-mosaic .cv-contacts svg{color:#725b9a;width:12px;height:12px;flex-basis:12px}
.cv-sheet .cv-mosaic-art{width:156px;height:156px;display:grid;grid-template-columns:1fr 1fr;gap:7px}
.cv-sheet .cv-mosaic-art span:nth-child(1){background:#bea8df;border-radius:100% 0 0 0}
.cv-sheet .cv-mosaic-art span:nth-child(2){background:#eec294;border-radius:50%}
.cv-sheet .cv-mosaic-art span:nth-child(3){background:#45695f;border-radius:0 0 0 100%}
.cv-sheet .cv-mosaic-art span:nth-child(4){background:#e8a798;border-radius:0 0 100% 0}
.cv-sheet .cv-mosaic-summary{padding:19px 23px;background:#f0edf6;border-left:3px solid #a48ac6;margin-bottom:28px}
.cv-sheet .cv-mosaic-summary .cv-section{margin:0}
.cv-sheet .cv-mosaic-summary .cv-section h2{display:none}
.cv-sheet .cv-mosaic-summary .cv-paragraph{font-size:12.5px;line-height:1.8;color:#554d66}
.cv-sheet .cv-mosaic-grid{display:grid;grid-template-columns:minmax(0,1fr) 193px;gap:29px}
.cv-sheet.cv-mosaic .cv-section h2{color:#725b9a;font-size:9.6px;letter-spacing:1.5px}
.cv-sheet.cv-mosaic .cv-section{margin-bottom:25px}
.cv-sheet.cv-mosaic .cv-entry-head{display:block}
.cv-sheet.cv-mosaic .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:5px;font-size:9.8px}
.cv-sheet.cv-mosaic .cv-entry h3{font-size:12.6px;color:#343246}
.cv-sheet.cv-mosaic .cv-paragraph,.cv-sheet.cv-mosaic .cv-bullets{font-size:11.5px;line-height:1.7}
.cv-sheet .cv-mosaic-grid aside{background:#f7f4ef;padding:20px 19px;align-self:start}
.cv-sheet .cv-mosaic-grid aside .cv-skill-list{grid-template-columns:1fr;gap:6px;font-size:10.6px}
.cv-sheet .cv-mosaic-grid aside .cv-entry h3{font-size:11.3px}
.cv-sheet .cv-mosaic-grid aside .cv-paragraph{font-size:10.2px}
.cv-sheet .cv-mosaic-grid .cv-tools{gap:11px}
.cv-sheet .cv-mosaic-grid .cv-tool{font-size:9px}
@media print{.cv-sheet.cv-atelier,.cv-sheet .cv-atelier-rail{min-height:297mm}}
`;
