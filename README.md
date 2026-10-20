# Bursa Mimari Atlası 3B

Bursa Atatürk Caddesi ve Orhan Meydanı çevresindeki yapıları özgün 3B yorumlarla inceleyen statik web uygulaması. İş Bankası ile Kent Hotel ortak sahnede bitişik konumlanır; Osmanlı Bankası / İttihat ve Terakki Kulübü aynı kayıp yapının farklı dönemleridir. Ulu Cami ve Mecidiye Çinili Çeşme ayrı model sayfasındadır.

**Atlas:** https://ahmetguner74.github.io/bursa-mimari-atlasi-3d/birlikte.html

`docs/` doğrudan GitHub Pages'ten yayımlanır. Yerelde denemek için bu klasörde `python -m http.server 8000 -d docs` çalıştırıp `http://localhost:8000/birlikte.html` adresini açın. ES module ve model veri dosyaları nedeniyle sayfalar dosya sisteminden doğrudan açılmamalıdır.

Modeller DGN oturum verileri, fotoğraf karşılaştırmaları ve kaynaklarda açıkça belirtilen görsel yorumlarla oluşturuldu; rölöve veya güncel saha ölçümü değildir. Yapı bazındaki **Kaynaklar** pencereleri ve JSON kayıtları dayanakları ve belirsizlikleri açıklar. Özgün DGN dosyaları ile yeniden dağıtım izni doğrulanmamış kullanıcı fotoğrafları bu depoda yoktur. İş Bankası sayfasında gösterilen iki Wikimedia Commons fotoğrafının atıf ve lisansları [medya kaydında](docs/media/ATTRIBUTION.md) bulunur. `vendor/` altındaki Three.js bileşenleri kendi MIT lisanslarıyla gelir.

Ortak sahnenin silik 2B altlığı, H22D07A3A ve H22D07A4B DGN paftalarından çözümlenen çatı izdüşümleri, bordürler, duvarlar ve merdivenleri içerir. `docs/dgn-underlay.json` aynı metre koordinat sisteminde 45 çatı alanı ve 72 çizgi parçası taşır; düzleştirilmiş görsel bağlamdır, kadastro veya güncel ölçüm verisi değildir. Kaynak pafta SHA-256 değerleri JSON içinde kayıtlıdır. Ham DGN dosyaları olmadan yeniden üretilemez; yerel kaynak çözümleme klasörü ile `python tools/generate_dgn_underlay.py PATH_TO_ULUCAMI_FLAT_MAP_EXPERIMENT` çalıştırılır (Shapely gerekir).

Hayvanat bahçesi modeli ayrı [projede](https://github.com/ahmetguner74/bursa-hayvanat-bahcesi-3d) sürdürülür.
