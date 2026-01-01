# Türkiye Yangın Haritası

Türkiye genelinde tespit edilen aktif yangın noktalarını harita üzerinde
görselleştiren web tabanlı bir uygulamadır. Projenin temel amacı, uydu
kaynaklı yangın verilerini sade ve anlaşılır bir biçimde sunarak afet
farkındalığını artırmaktır.

---

## Proje Hakkında

Bu uygulama, uydu tabanlı termal algılama sistemlerinden elde edilen
yangın ve yüksek ısı anomalisi verilerini kullanarak, Türkiye coğrafyası
üzerinde konumsal bir görselleştirme sunar. Gerçek zamanlıya yakın
verilerle çalışan sistem, eğitim, analiz ve farkındalık amaçlı
geliştirilmiştir.

---

## Yangın Verisi Kaynağı

Projede kullanılan yangın verileri, VIIRS (Visible Infrared Imaging
Radiometer Suite) sensörlerinden elde edilen uydu tabanlı termal
gözlemlere dayanmaktadır.

Veriler, ArcGIS REST API üzerinden aşağıdaki filtreler uygulanarak
çekilmektedir:

- Zaman filtresi: Son 24 saat
- Konum filtresi: Türkiye coğrafi sınırları (bounding box)
- Termal veri: Brightness (ısı yoğunluğu)
- Veri türü: Yangın ve yüksek ısı anomalisi

API’den elde edilen veriler, frontend tarafında GeoJSON formatına
dönüştürülerek harita üzerinde noktasal (Point) olarak
görselleştirilmektedir.

Not: Gösterilen noktalar kesin yangın doğrulaması anlamına gelmez.
Uydu sensörleri tarafından tespit edilen yüksek ısı anomalilerini temsil
eder.

---

## Özellikler

- Harita tabanlı yangın görselleştirmesi
- Konuma ve zamana bağlı veri filtreleme
- Uydu tabanlı gerçek veri kullanımı
- Hafif ve hızlı frontend mimarisi
- Modern web geliştirme araçları ile oluşturulmuş yapı

---

## Kurulum

Projeyi yerel ortamda çalıştırmak için aşağıdaki adımları izleyin.

Depoyu klonladıktan sonra bağımlılıkları yükleyin:

```bash
npm install
npm run dev
