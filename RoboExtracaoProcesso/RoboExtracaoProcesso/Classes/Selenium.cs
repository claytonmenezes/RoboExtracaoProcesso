using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using System.Linq;

namespace RoboExtracaoProcesso.Classes
{
    public class Selenium
    {
        IWebDriver driver;

        public void startBrowser()
        {
            driver = new ChromeDriver();
            driver.Manage().Window.Minimize();
            driver.Url = "https://sistemas.anm.gov.br/SCM/site/admin/dadosProcesso.aspx";
        }
        public void PreencheNumeroProcesso ()
        {
            var t = driver.FindElement(By.Id("ctl00_conteudo_txtNumeroProcesso"));
            t.SendKeys("123456");
        }
        public string downloadCaptcha()
        {
            var base64string = (driver as IJavaScriptExecutor).ExecuteScript(@"
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                document.getElementByXPath = function(sValue) { var a = this.evaluate(sValue, this, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); if (a.snapshotLength > 0) { return a.snapshotItem(0); } };

                function getMaxSize(srcWidth, srcHeight, maxWidth, maxHeight) {
                    var widthScale = null;
                    var heightScale = null;

                    if (maxWidth != null)
                    {
                        widthScale = maxWidth / srcWidth;
                    }
                    if (maxHeight != null)
                    {
                        heightScale = maxHeight / srcHeight;
                    }

                    var ratio = Math.min(widthScale || heightScale, heightScale || widthScale);
                    return {
                        width: Math.round(srcWidth * ratio),
                        height: Math.round(srcHeight * ratio)
                    };
                }

                function getBase64FromImage(img, width, height) {
                    var size = getMaxSize(width, height, 600, 600)
                    canvas.width = size.width;
                    canvas.height = size.height;
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, size.width, size.height);
                    ctx.drawImage(img, 0, 0, size.width, size.height);
                    return canvas.toDataURL('image/jpeg', 0.9);
                }

                var img = document.getElementByXPath('//*[@id=""ctl00_conteudo_trCaptcha""]/td[2]/div[1]/span[1]/img');
                    return getBase64FromImage(img, img.width, img.height);
                ") as string;

            return base64string.Split(',').Last();
        }
        public void closeBrowser()
        {
            driver.Close();
        }
    }
}
