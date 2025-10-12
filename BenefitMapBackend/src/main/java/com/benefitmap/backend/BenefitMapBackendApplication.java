package com.benefitmap.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import me.paulschwarz.springdotenv.SourceProperty;

@SpringBootApplication
public class BenefitMapBackendApplication {

	public static void main(String[] args) {
		SourceProperty.activate();
		SpringApplication.run(BenefitMapBackendApplication.class, args);
	}

}
