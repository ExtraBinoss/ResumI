/** Offline A4 art direction, authored as real text, editable images and simple geometry. */
export const curatedCss = `
/* Keep paint order aligned with document order in selectable-text PDF exports. */
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) *{isolation:isolate}
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama){font-family:ResumeInter,Arial,sans-serif;letter-spacing:0;--cv-accent:currentColor}
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) .cv-section{margin-bottom:25px}
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) .cv-entry-head{display:block;margin-bottom:7px}
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) .cv-entry-head .cv-meta{max-width:none;text-align:left;margin-top:4px}
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) .cv-entry{margin-bottom:19px}
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) .cv-section h2{font-size:9px;letter-spacing:1.6px;margin-bottom:13px;color:inherit}
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) .cv-entry h3{font-size:12.5px;line-height:1.5;color:inherit}
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) .cv-paragraph,.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) .cv-bullets{font-size:11.4px;line-height:1.75;color:inherit}
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) .cv-meta{font-size:9px;line-height:1.6;color:#7b716b}
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) .cv-bullets{padding-left:13px}
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) .cv-bullets li{padding-left:2px;margin-bottom:5px}
.cv-sheet:is(.cv-maison,.cv-gallery,.cv-forma,.cv-linen,.cv-muse,.cv-cinema,.cv-panorama) .cv-skill-list{grid-template-columns:1fr;gap:5px;font-size:10.4px;line-height:1.6;color:inherit}
.cv-sheet .cv-cu-folio{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-top:27px;padding-top:13px;border-top:1px solid currentColor;font-size:7px;letter-spacing:1.4px}
.cv-sheet .cv-cu-portrait{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 38%}
.cv-sheet .cv-cu-arch{display:block;width:100%;height:auto}

.cv-sheet.cv-maison{padding:36px 48px 32px;background:#f9f4e9;color:#563239}
.cv-sheet.cv-maison .cv-cu-maison-top{display:flex;justify-content:space-between;font-size:7px;letter-spacing:2px;border-top:2px solid #563239;padding-top:12px}
.cv-sheet.cv-maison .cv-cu-maison-header{display:grid;grid-template-columns:minmax(0,1fr) 150px;align-items:center;gap:35px;padding:28px 0 18px}
.cv-sheet.cv-maison .cv-name{font:400 76px/.97 Georgia,'Times New Roman',serif;letter-spacing:-4px;color:#63323e;max-width:430px}
.cv-sheet.cv-maison .cv-role{font-size:12px;line-height:1.5;letter-spacing:2.4px;text-transform:uppercase;color:#63323e;max-width:380px;margin-top:23px}
.cv-sheet.cv-maison .cv-cu-maison-photo{height:196px;padding:8px 8px 22px;border:1px solid #b9a094}
.cv-sheet.cv-maison .cv-cu-maison-photo .cv-cu-portrait{height:164px;filter:grayscale(1)}
.cv-sheet.cv-maison .cv-cu-photo-label{display:block;font-size:5.7px;letter-spacing:1.8px;text-align:center;margin-top:7px}
.cv-sheet.cv-maison .cv-cu-maison-contact{border-top:1px solid #b9a094;border-bottom:1px solid #b9a094;padding:12px 0}
.cv-sheet.cv-maison .cv-contacts{margin:0;font-size:9.5px;gap:7px 25px;color:#775b58}
.cv-sheet.cv-maison .cv-cu-maison-intro{padding:18px 0 20px}
.cv-sheet.cv-maison .cv-cu-maison-intro .cv-section{display:grid;grid-template-columns:139px 1fr;gap:30px;margin:0}
.cv-sheet.cv-maison .cv-cu-maison-intro .cv-paragraph{font:400 17px/1.55 Georgia,'Times New Roman',serif;letter-spacing:-.15px}
.cv-sheet.cv-maison .cv-cu-maison-body{display:grid;grid-template-columns:minmax(0,1fr) 179px;gap:38px;border-top:1px solid #b9a094;padding-top:20px}
.cv-sheet.cv-maison .cv-cu-maison-body aside{border-left:1px solid #d4c4b6;padding-left:23px}
.cv-sheet.cv-maison .cv-cu-maison-body main .cv-section h2{border-bottom:1px solid #d4c4b6;padding-bottom:9px}
.cv-sheet.cv-maison .cv-entry h3{font:400 16px/1.4 Georgia,'Times New Roman',serif}
.cv-sheet.cv-maison aside .cv-entry h3{font-size:13px}
.cv-sheet.cv-maison aside .cv-paragraph{font-size:10px}
.cv-sheet.cv-maison .cv-section{margin-bottom:20px}
.cv-sheet.cv-maison .cv-cu-folio{margin-top:18px;border-color:#b9a094;color:#886b63}

.cv-sheet.cv-gallery{padding:31px 43px;background:#f4f1e8;color:#202c50}
.cv-sheet.cv-gallery .cv-cu-gallery-top{display:flex;justify-content:space-between;font-size:7px;letter-spacing:1.3px;color:#2442d4;padding-bottom:14px;border-bottom:2px solid #2442d4}
.cv-sheet.cv-gallery .cv-cu-gallery-header{display:grid;grid-template-columns:minmax(0,1fr) 151px;gap:23px;align-items:center;padding:27px 0 25px}
.cv-sheet.cv-gallery .cv-name{font-size:76px;line-height:.96;font-weight:760;letter-spacing:-5px;color:#2442d4;max-width:430px}
.cv-sheet.cv-gallery .cv-role{font-size:14px;line-height:1.4;color:#2442d4;margin-top:19px;max-width:430px;font-weight:550}
.cv-sheet.cv-gallery .cv-cu-gallery-art{position:relative;width:151px;height:151px;transform:rotate(-9deg);background:#2442d4}
.cv-sheet.cv-gallery .cv-cu-gallery-art>span{display:block;position:absolute}
.cv-sheet.cv-gallery .cv-cu-gallery-circle{width:98px;height:98px;left:26.5px;top:26.5px;border-radius:50%;background:#f4f1e8}
.cv-sheet.cv-gallery .cv-cu-gallery-cross-v{width:17px;height:151px;left:67px;top:0;background:#2442d4}
.cv-sheet.cv-gallery .cv-cu-gallery-cross-h{width:151px;height:17px;left:0;top:67px;background:#2442d4}
.cv-sheet.cv-gallery .cv-cu-gallery-dot{width:36px;height:36px;left:57.5px;top:57.5px;border-radius:50%;background:#f3bb70}
.cv-sheet.cv-gallery .cv-contacts{margin:0;padding:11px 0;border-top:1px solid #2442d4;border-bottom:1px solid #2442d4;font-size:9px;color:#2442d4;gap:7px 25px}
.cv-sheet.cv-gallery .cv-cu-gallery-intro{display:grid;grid-template-columns:56px minmax(0,1fr);gap:18px;padding:24px 0;border-bottom:1px solid #2442d4}
.cv-sheet.cv-gallery .cv-cu-big-index{font-size:34px;line-height:1;font-weight:650;letter-spacing:-2px;color:#2442d4}
.cv-sheet.cv-gallery .cv-cu-gallery-intro .cv-section{margin:0}
.cv-sheet.cv-gallery .cv-cu-gallery-intro .cv-paragraph{font-size:14px;line-height:1.65;max-width:590px}
.cv-sheet.cv-gallery .cv-cu-gallery-body{display:grid;grid-template-columns:1.15fr 1fr;gap:29px;padding-top:22px}
.cv-sheet.cv-gallery .cv-cu-gallery-cell{display:grid;grid-template-columns:40px minmax(0,1fr);gap:12px}
.cv-sheet.cv-gallery .cv-cu-gallery-cell+.cv-cu-gallery-cell{border-left:1px solid #a5add4;padding-left:22px;grid-template-columns:32px minmax(0,1fr)}
.cv-sheet.cv-gallery .cv-cu-gallery-cell .cv-cu-big-index{font-size:24px}
.cv-sheet.cv-gallery .cv-section h2{color:#2442d4;letter-spacing:1.3px;font-size:8px}
.cv-sheet.cv-gallery .cv-entry h3{font-weight:700;font-size:11.5px}
.cv-sheet.cv-gallery .cv-paragraph,.cv-sheet.cv-gallery .cv-bullets{font-size:10.7px;line-height:1.75}
.cv-sheet.cv-gallery .cv-cu-gallery-support{display:grid;grid-template-columns:1.1fr 1fr .8fr;gap:30px;padding-top:22px;margin-top:4px;border-top:3px solid #2442d4}
.cv-sheet.cv-gallery .cv-cu-gallery-support .cv-paragraph{font-size:10px}
.cv-sheet.cv-gallery .cv-cu-folio{margin-top:16px;border-color:#2442d4;color:#2442d4;font-weight:600}

.cv-sheet.cv-forma{padding:0 43px 31px;background:#f2eee6;color:#453e36}
.cv-sheet.cv-forma .cv-cu-forma-band{display:flex;justify-content:space-between;background:#a75337;color:#fff4e8;margin:0 -43px;padding:16px 43px;font-size:7px;letter-spacing:1.5px}
.cv-sheet.cv-forma .cv-cu-forma-header{display:grid;grid-template-columns:minmax(0,1fr) 176px;gap:28px;align-items:center;padding:25px 0 18px}
.cv-sheet.cv-forma .cv-cu-forma-kicker{font:7px/1.5 monospace;letter-spacing:1.4px;color:#a75337;display:block;margin-bottom:17px}
.cv-sheet.cv-forma .cv-name{font:400 69px/1.02 Georgia,'Times New Roman',serif;letter-spacing:-3px;color:#544036;max-width:440px}
.cv-sheet.cv-forma .cv-role{font-size:12px;color:#a75337;margin-top:16px;letter-spacing:.8px}
.cv-sheet.cv-forma .cv-cu-arch{color:#a75337;width:176px}
.cv-sheet.cv-forma .cv-contacts{margin:0;border-top:1px solid #b4a494;border-bottom:1px solid #b4a494;padding:12px 0;font:9px/1.5 monospace;color:#796758;gap:6px 22px}
.cv-sheet.cv-forma .cv-cu-forma-body{display:grid;grid-template-columns:173px minmax(0,1fr);gap:35px;margin-top:24px}
.cv-sheet.cv-forma .cv-cu-forma-body aside{padding-right:24px;border-right:1px solid #cbbeb0}
.cv-sheet.cv-forma .cv-cu-forma-note{margin-bottom:25px;color:#a75337}
.cv-sheet.cv-forma .cv-cu-forma-note>span{font:7px monospace;letter-spacing:1.2px}
.cv-sheet.cv-forma .cv-cu-forma-note svg{display:block;width:145px;margin-top:11px}
.cv-sheet.cv-forma .cv-cu-forma-note img{display:block;width:148px;height:132px;margin-top:11px;object-fit:cover;object-position:50% 50%}
.cv-sheet.cv-forma .cv-section h2{font:700 8px/1.5 monospace;letter-spacing:1.4px;color:#a75337}
.cv-sheet.cv-forma main>.cv-section{border-bottom:1px solid #d3c6b6;padding-bottom:22px}
.cv-sheet.cv-forma main>.cv-section:last-child{border:0;padding-bottom:0}
.cv-sheet.cv-forma .cv-entry h3{font-size:12px;font-weight:600}
.cv-sheet.cv-forma aside .cv-entry h3{font:400 14px/1.4 Georgia,'Times New Roman',serif}
.cv-sheet.cv-forma aside .cv-paragraph{font-size:10px}
.cv-sheet.cv-forma .cv-cu-folio{border-color:#b4a494;color:#8f6d55;font-family:monospace}

.cv-sheet.cv-linen{padding:35px 52px 30px;background:#fafaf5;color:#3c4940}
.cv-sheet.cv-linen .cv-cu-linen-top{display:flex;justify-content:space-between;font-size:6.7px;letter-spacing:2.2px;padding-bottom:13px;border-bottom:1px solid #b7c0b2}
.cv-sheet.cv-linen .cv-cu-linen-header{display:grid;grid-template-columns:minmax(0,1fr) 177px;gap:30px;align-items:center;margin-top:24px}
.cv-sheet.cv-linen .cv-name{font:400 82px/.97 Georgia,'Times New Roman',serif;letter-spacing:-4px;color:#3c4940;max-width:420px}
.cv-sheet.cv-linen .cv-role{font-size:10px;line-height:1.6;text-transform:uppercase;letter-spacing:2.8px;color:#6d7a64;max-width:350px;margin-top:22px}
.cv-sheet.cv-linen .cv-cu-linen-photo{height:215px;background:#dce1d5;padding:0 0 0 14px}
.cv-sheet.cv-linen .cv-cu-linen-photo .cv-cu-portrait{object-position:50% 34%;filter:grayscale(1)}
.cv-sheet.cv-linen .cv-cu-linen-contact{padding:18px 0 22px;border-bottom:1px solid #b7c0b2}
.cv-sheet.cv-linen .cv-contacts{margin:0;font-size:9px;color:#75806d;gap:6px 22px}
.cv-sheet.cv-linen .cv-cu-linen-body{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:39px;padding-top:27px}
.cv-sheet.cv-linen .cv-cu-linen-body aside{background:#e9ede3;margin-top:54px;padding:23px 21px 25px;align-self:start}
.cv-sheet.cv-linen .cv-cu-linen-aside-label{display:block;font-size:7px;letter-spacing:2px;padding-bottom:17px;margin-bottom:22px;border-bottom:1px solid #b7c0b2}
.cv-sheet.cv-linen .cv-section h2{font-size:8px;font-weight:500;letter-spacing:2px;color:#6d7a64}
.cv-sheet.cv-linen main .cv-entry h3{font:400 17px/1.4 Georgia,'Times New Roman',serif;letter-spacing:-.2px}
.cv-sheet.cv-linen main>.cv-section:first-child .cv-paragraph{font:italic 400 17px/1.6 Georgia,'Times New Roman',serif;color:#607059}
.cv-sheet.cv-linen main>.cv-section{margin-bottom:27px}
.cv-sheet.cv-linen .cv-paragraph,.cv-sheet.cv-linen .cv-bullets{font-size:10.7px}
.cv-sheet.cv-linen aside .cv-paragraph{font-size:9.5px}
.cv-sheet.cv-linen aside .cv-entry h3{font-size:10.4px}
.cv-sheet.cv-linen .cv-skill-list{font-size:9.6px;gap:6px}
.cv-sheet.cv-linen .cv-cu-folio{border-color:#b7c0b2;color:#6d7a64;font-size:6.5px}

.cv-sheet.cv-muse{padding:40px 46px 32px;background:#f7f2fb;color:#42354f;overflow:hidden}
.cv-sheet.cv-muse .cv-cu-muse-orbit{position:absolute;right:0;top:0;width:280px;height:280px;border:1px solid #c6b6d8;border-radius:50%;z-index:-1}
.cv-sheet.cv-muse .cv-cu-muse-orbit span{position:absolute;border:1px solid #c6b6d8;border-radius:50%;inset:24px}
.cv-sheet.cv-muse .cv-cu-muse-orbit span+span{inset:48px}.cv-sheet.cv-muse .cv-cu-muse-orbit span+span+span{inset:72px;background:#e2d1f0}
.cv-sheet.cv-muse .cv-cu-muse-header{display:grid;grid-template-columns:minmax(0,1fr) 179px;gap:25px;align-items:end;padding-bottom:28px}
.cv-sheet.cv-muse .cv-cu-muse-kicker{display:block;font-size:7px;letter-spacing:1.7px;color:#84679c;margin-bottom:28px}
.cv-sheet.cv-muse .cv-name{font:400 75px/.98 Georgia,'Times New Roman',serif;letter-spacing:-4px;color:#594269;max-width:430px}
.cv-sheet.cv-muse .cv-role{font-size:13px;line-height:1.5;color:#806192;margin-top:20px;max-width:365px}
.cv-sheet.cv-muse .cv-cu-muse-photo{height:224px;border-radius:100px;overflow:hidden;background:#dac2e6;border:7px solid #e8daef}
.cv-sheet.cv-muse .cv-cu-portrait{object-position:50% 32%;border-radius:93px}
.cv-sheet.cv-muse .cv-contacts{margin:0;border-top:1px solid #c6b6d8;border-bottom:1px solid #c6b6d8;padding:12px 0;font-size:9px;color:#806192;gap:5px 24px}
.cv-sheet.cv-muse .cv-cu-muse-intro{border-radius:24px;background:#e7daee;margin:24px 0;padding:20px 26px}
.cv-sheet.cv-muse .cv-cu-muse-intro .cv-section{display:grid;grid-template-columns:110px minmax(0,1fr);gap:18px;margin:0}
.cv-sheet.cv-muse .cv-cu-muse-intro .cv-paragraph{font-size:12px;line-height:1.7}
.cv-sheet.cv-muse .cv-cu-muse-body{display:grid;grid-template-columns:minmax(0,1fr) 178px;gap:38px}
.cv-sheet.cv-muse .cv-cu-muse-body aside{border-left:1px solid #c6b6d8;padding-left:24px}
.cv-sheet.cv-muse .cv-section h2{font-size:8px;letter-spacing:1.8px;color:#806192}
.cv-sheet.cv-muse main>.cv-section{padding-top:16px;border-top:1px solid #c6b6d8}
.cv-sheet.cv-muse main .cv-entry h3{font-size:12px;font-weight:600}
.cv-sheet.cv-muse .cv-paragraph,.cv-sheet.cv-muse .cv-bullets{font-size:10.7px}
.cv-sheet.cv-muse aside .cv-paragraph{font-size:10px}
.cv-sheet.cv-muse .cv-cu-folio{border-color:#c6b6d8;color:#806192;font-size:6.3px;letter-spacing:1.1px}

.cv-sheet.cv-cinema{padding:26px 48px 32px;background:#232723;color:#e8e5d9}
.cv-sheet.cv-cinema .cv-cu-cinema-perfs{display:flex;justify-content:space-between;gap:14px;border-bottom:1px solid #565c4f;padding-bottom:18px}
.cv-sheet.cv-cinema .cv-cu-cinema-perfs span{display:block;flex:1;height:11px;border-radius:2px;background:#c8c1a2}
.cv-sheet.cv-cinema .cv-cu-cinema-top{display:flex;justify-content:space-between;font:7px/1.5 monospace;letter-spacing:1.5px;color:#d5b570;margin-top:14px}
.cv-sheet.cv-cinema .cv-cu-cinema-header{text-align:center;padding:26px 0 20px}
.cv-sheet.cv-cinema .cv-cu-cinema-presents{display:block;font-size:7px;letter-spacing:3px;color:#acae9b;margin-bottom:21px}
.cv-sheet.cv-cinema .cv-name{font:400 80px/.96 Georgia,'Times New Roman',serif;letter-spacing:-3.3px;color:#e8d6a0;max-width:none}
.cv-sheet.cv-cinema .cv-role{margin-top:18px;font:10px/1.6 ResumeInter,Arial,sans-serif;text-transform:uppercase;letter-spacing:3px;color:#d3d4c4}
.cv-sheet.cv-cinema .cv-cu-cinema-line{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:24px;font-size:6px;letter-spacing:2px;color:#969e87}
.cv-sheet.cv-cinema .cv-cu-cinema-line>span:first-child,.cv-sheet.cv-cinema .cv-cu-cinema-line>span:last-child{height:1px;width:83px;background:#69715c}
.cv-sheet.cv-cinema .cv-contacts{margin:0;justify-content:center;padding:11px 0;border-top:1px solid #69715c;border-bottom:1px solid #69715c;font-size:9px;gap:6px 25px;color:#b9bda9}
.cv-sheet.cv-cinema .cv-cu-cinema-intro{max-width:550px;text-align:center;margin:25px auto 27px}
.cv-sheet.cv-cinema .cv-cu-cinema-intro .cv-section h2{font-size:7px;color:#d5b570;letter-spacing:2px}
.cv-sheet.cv-cinema .cv-cu-cinema-intro .cv-paragraph{font:400 15px/1.6 Georgia,'Times New Roman',serif;color:#d8d8c9}
.cv-sheet.cv-cinema .cv-cu-cinema-body{display:grid;grid-template-columns:1.12fr 1fr;gap:33px}
.cv-sheet.cv-cinema .cv-cu-cinema-body>.cv-section{border-top:1px solid #69715c;padding-top:16px;margin-bottom:0}
.cv-sheet.cv-cinema .cv-section h2{font-size:8px;letter-spacing:2px;color:#d5b570}
.cv-sheet.cv-cinema .cv-entry h3{font-size:12px;color:#e7ddbf;font-weight:500}
.cv-sheet.cv-cinema .cv-meta{font:8px/1.65 monospace;color:#aab198;opacity:1}
.cv-sheet.cv-cinema .cv-paragraph,.cv-sheet.cv-cinema .cv-bullets{font-size:10.3px;line-height:1.8;color:#c1c5b3}
.cv-sheet.cv-cinema .cv-cu-cinema-support{display:grid;grid-template-columns:1.1fr 1fr .8fr;gap:30px;padding-top:22px;margin-top:25px;border-top:1px solid #69715c}
.cv-sheet.cv-cinema .cv-cu-cinema-support .cv-paragraph,.cv-sheet.cv-cinema .cv-skill-list{font-size:9.5px;color:#b9bda9}
.cv-sheet.cv-cinema .cv-cu-cinema-support .cv-entry h3{font-size:10px}
.cv-sheet.cv-cinema .cv-cu-folio{border-color:#69715c;color:#d5b570;font-size:6.5px;letter-spacing:1.7px}

.cv-sheet.cv-panorama{padding:32px 43px;background:#f8f7f2;color:#294945}
.cv-sheet.cv-panorama .cv-cu-panorama-top{display:flex;justify-content:space-between;font-size:7px;letter-spacing:1.5px;border-top:1px solid #78938a;padding-top:12px;margin-bottom:18px;color:#71857a}
.cv-sheet.cv-panorama .cv-name{font:400 70px/.98 Georgia,'Times New Roman',serif;letter-spacing:-3px;color:#294945}
.cv-sheet.cv-panorama .cv-role{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#71857a;margin-top:13px;margin-bottom:22px}
.cv-sheet.cv-panorama .cv-cu-panorama-image{height:213px;position:relative;margin:0 -43px;background:#597775}
.cv-sheet.cv-panorama .cv-cu-panorama-image>img,.cv-sheet.cv-panorama .cv-cu-panorama-image>svg{width:100%;height:100%;display:block;object-fit:cover;object-position:50% 48%}
.cv-sheet.cv-panorama .cv-cu-panorama-caption{display:flex;justify-content:space-between;position:absolute;bottom:0;left:0;right:0;background:#234440;color:#f8f7f2;padding:10px 43px;font-size:6px;letter-spacing:1.5px}
.cv-sheet.cv-panorama .cv-contacts{margin:0;border-bottom:1px solid #b5c2b8;padding:14px 0;font-size:9px;color:#71857a;gap:5px 24px}
.cv-sheet.cv-panorama .cv-cu-panorama-body{display:grid;grid-template-columns:minmax(0,1fr) 176px;gap:36px;margin-top:24px}
.cv-sheet.cv-panorama .cv-cu-panorama-body aside{padding-left:24px;border-left:1px solid #b5c2b8}
.cv-sheet.cv-panorama .cv-section h2{color:#71857a;font-size:8px;letter-spacing:1.6px}
.cv-sheet.cv-panorama main>.cv-section:first-child .cv-paragraph{font:400 15px/1.6 Georgia,'Times New Roman',serif}
.cv-sheet.cv-panorama .cv-paragraph,.cv-sheet.cv-panorama .cv-bullets{font-size:10.4px;line-height:1.7}
.cv-sheet.cv-panorama .cv-entry h3{font-size:11.7px;font-weight:550}
.cv-sheet.cv-panorama aside .cv-entry h3{font-size:10.5px}
.cv-sheet.cv-panorama aside .cv-paragraph,.cv-sheet.cv-panorama .cv-skill-list{font-size:9.7px}
.cv-sheet.cv-panorama .cv-cu-folio{color:#71857a;border-color:#b5c2b8;font-size:6px;letter-spacing:1.2px;margin-top:22px}
`;
