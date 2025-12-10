import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateCertificate = async (data, username) => {
    // Create a temporary DOM element for the certificate
    const cert = document.createElement('div');
    cert.style.width = '800px';
    cert.style.padding = '40px';
    cert.style.background = '#050510';
    cert.style.color = 'white';
    cert.style.fontFamily = 'Helvetica, Arial, sans-serif';
    cert.style.position = 'fixed';
    cert.style.top = '-9999px'; // Hide it
    cert.style.left = '-9999px';
    cert.style.border = '10px solid #00f0ff';

    // Determine Status
    const isVerified = data.realityScore >= 60;
    const statusColor = isVerified ? '#00ff9d' : '#ff0055';
    const statusText = isVerified ? 'VERIFIED HUMAN' : 'HIGH RISK BOT';

    cert.innerHTML = `
        <div style="text-align: center; border: 2px solid rgba(255,255,255,0.1); padding: 20px;">
            <h1 style="color: #00f0ff; letter-spacing: 5px; margin-bottom: 10px;">EL CAZADOR</h1>
            <p style="color: #888; font-size: 14px; text-transform: uppercase; margin-top: 0;">Forensic Authenticity Report</p>
            
            <hr style="border-color: #333; margin: 30px 0;" />

            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 30px;">
                ${data.avatarUrl ? `<img src="${data.avatarUrl}" style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid ${statusColor}; margin-right: 20px;">` : ''}
                <div style="text-align: left;">
                    <h2 style="margin: 0; font-size: 24px;">${data.profileName}</h2>
                    <p style="margin: 5px 0 0 0; color: #aaa;">Bio: ${data.bio || 'N/A'}</p>
                </div>
            </div>

            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 10px 0; color: #aaa;">REALITY SCORE</h3>
                <div style="font-size: 60px; font-weight: bold; color: ${statusColor};">${data.realityScore}%</div>
                <div style="font-size: 20px; font-weight: bold; margin-top: 10px; color: ${statusColor}; border: 1px solid ${statusColor}; display: inline-block; padding: 5px 15px; border-radius: 5px;">
                    ${statusText}
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left;">
                <div style="padding: 15px; background: #111;">
                    <strong style="color: #888; display: block; font-size: 12px;">SUSPICION RATE</strong>
                    <span style="font-size: 18px; color: #ff0055;">${data.metrics.suspicionRate}</span>
                </div>
                <div style="padding: 15px; background: #111;">
                    <strong style="color: #888; display: block; font-size: 12px;">ESTIMATED REAL</strong>
                    <span style="font-size: 18px; color: white;">${data.metrics.estimatedReal}</span>
                </div>
            </div>

            ${data.suspicionFlags.length > 0 ? `
                <div style="margin-top: 30px; text-align: left;">
                    <strong style="color: #ff0055;">⚠️ ANOMALIES DETECTED:</strong>
                    <ul style="color: #ccc; font-size: 14px;">
                        ${data.suspicionFlags.map(flag => `<li>${flag}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <hr style="border-color: #333; margin: 30px 0;" />
            
            <div style="display: flex; justify-content: space-between; align-items: center; color: #666; font-size: 10px;">
                <div>
                   AUDIT ID: ${Date.now().toString().slice(-8)}<br>
                   AGENT: ${username || 'UNKNOWN'}
                </div>
                <div style="text-align: right;">
                    CERTIFIED BY EL CAZADOR<br>
                    ${new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(cert);

    try {
        const canvas = await html2canvas(cert, {
            backgroundColor: '#050510',
            scale: 2 // High resolution
        });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`Review_${data.profileName.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } finally {
        document.body.removeChild(cert);
    }
};
