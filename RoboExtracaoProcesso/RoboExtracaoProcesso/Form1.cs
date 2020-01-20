using RoboExtracaoProcesso.Classes;
using System.Windows.Forms;

namespace RoboExtracaoProcesso
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, System.EventArgs e)
        {
            var selenium = new Selenium();
            //var solver = new HumanCoder("http://api.captchaboss.com/Imagepost.ashx", "C44CPSGKH964LH534A64UXMQPMY7UKVJ9Z2LQZV3");

            selenium.startBrowser();
            selenium.PreencheNumeroProcesso();
            var imgBase64 = selenium.downloadCaptcha();
            //solver.SolveCaptcha(imgBase64);
            //string CaptchaText = solver.LastResponseText;
            selenium.closeBrowser();
        }
    }
}
