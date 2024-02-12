class Cartouche {
	
	title;
	subtitle;
	
	constructor (title,subtitle){	
		this.title = title;
		this.subtitle = subtitle;		
	}
	
	static getCartouche(cartoucheSVGelement){
		
		let title = document.getElementById('Title').textContent.trim();
		let subtitle = document.getElementById('Subtitle').textContent.trim();
		
		return new Cartouche(title,subtitle);
	}
	
}