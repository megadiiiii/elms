package org.megadiiiii.elms_api.config;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PasswordGenerator {

    public String generateSecurePassword() {
        // 1. Nguyên liệu
        String upperCase = RandomStringUtils.random(2, 65, 90, true, true);
        String lowerCase = RandomStringUtils.random(2, 97, 122, true, true);
        String numbers = RandomStringUtils.randomNumeric(2);
        String special = RandomStringUtils.random(2, 33, 47, false, false);
        String randomData = RandomStringUtils.randomAlphanumeric(2);

        String combined = upperCase.concat(lowerCase).concat(numbers).concat(special).concat(randomData);

        // 2. Trộn gỏi
        List<Character> pwdChars = combined.chars()
                .mapToObj(c -> (char) c)
                .collect(Collectors.toList());
        Collections.shuffle(pwdChars);

        // 3. Đóng gói
        return pwdChars.stream()
                .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append)
                .toString();
    }
}
